// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        id: "nguonc",
        name: "Phim NguonC",
        version: "1.0.9",
        baseUrl: "https://phim.nguonc.com",
        iconUrl: "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        isEnabled: true,
        type: "MOVIE",
        playerType: "embed"
    });
}

function getHomeSections() {
    return JSON.stringify([
        { slug: 'phim-dang-chieu', title: 'Phim Đang Chiếu', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-le', title: 'Phim Lẻ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'phim-bo', title: 'Phim Bộ', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'tv-shows', title: 'TV Shows', type: 'Horizontal', path: 'danh-sach' },
        { slug: 'hoat-hinh', title: 'Hoạt Hình', type: 'Horizontal', path: 'the-loai' },
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới Cập Nhật', type: 'Grid', path: 'phim-moi-cap-nhat' }
    ]);
}

// FIXED: dùng value thay vì slug
function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim đang chiếu', value: 'phim-dang-chieu' },
        { name: 'Phim lẻ', value: 'phim-le' },
        { name: 'Phim bộ', value: 'phim-bo' },
        { name: 'TV Shows', value: 'tv-shows' },
        { name: 'Hoạt hình', value: 'hoat-hinh' }
    ]);
}

function getFilterConfig() {
    return JSON.stringify({
        sort: [
            { name: 'Mới cập nhật', value: 'updated' },
            { name: 'Mới nhất', value: 'new' },
            { name: 'Lượt xem', value: 'view' }
        ]
    });
}

// =============================================================================
// URL GENERATION
// =============================================================================

function getUrlList(slug, filtersJson) {
    try {
        var filters = JSON.parse(filtersJson || "{}");
        var page = filters.page || 1;
        var sort = filters.sort || "updated";

        if (slug === 'phim-moi-cap-nhat' &&
            !filters.category &&
            !filters.country &&
            !filters.year) {
            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=" + page;
        }

        if (filters.category) {
            return "https://phim.nguonc.com/api/films/the-loai/" +
                filters.category +
                "?page=" + page +
                "&sort=" + sort;
        }

        if (filters.country) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" +
                filters.country +
                "?page=" + page +
                "&sort=" + sort;
        }

        if (filters.year) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" +
                filters.year +
                "?page=" + page +
                "&sort=" + sort;
        }

        if (/^\d{4}$/.test(slug)) {
            return "https://phim.nguonc.com/api/films/nam-phat-hanh/" +
                slug +
                "?page=" + page +
                "&sort=" + sort;
        }

        var listSlugs = [
            'phim-le',
            'phim-bo',
            'phim-dang-chieu',
            'tv-shows',
            'subteam'
        ];

        if (listSlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/danh-sach/" +
                slug +
                "?page=" + page +
                "&sort=" + sort;
        }

        var countrySlugs = [
            'au-my',
            'anh',
            'trung-quoc',
            'indonesia',
            'viet-nam',
            'phap',
            'hong-kong',
            'han-quoc',
            'nhat-ban',
            'thai-lan',
            'dai-loan',
            'nga',
            'ha-lan',
            'philippines',
            'an-do',
            'quoc-gia-khac'
        ];

        if (countrySlugs.indexOf(slug) >= 0) {
            return "https://phim.nguonc.com/api/films/quoc-gia/" +
                slug +
                "?page=" + page +
                "&sort=" + sort;
        }

        return "https://phim.nguonc.com/api/films/the-loai/" +
            slug +
            "?page=" + page +
            "&sort=" + sort;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword) {
    return "https://phim.nguonc.com/api/films/search?keyword=" +
        encodeURIComponent(keyword);
}

function getUrlDetail(slug) {
    if (slug.indexOf("http") === 0) return slug;
    return "https://phim.nguonc.com/api/film/" + slug;
}

function getUrlCategories() {
    return "https://phim.nguonc.com";
}

function getUrlCountries() {
    return "https://phim.nguonc.com";
}

function getUrlYears() {
    return "https://phim.nguonc.com";
}

// =============================================================================
// PARSERS
// =============================================================================

function parseListResponse(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);

        var data = response.data || {};
        var items = [];

        if (Array.isArray(data)) {
            items = data;
        } else if (Array.isArray(response.items)) {
            items = response.items;
        } else if (Array.isArray(data.items)) {
            items = data.items;
        }

        var paginate =
            response.paginate ||
            response.pagination ||
            (data.params && data.params.pagination) ||
            {};

        var movies = items.map(function(item) {
            return {
                id: item.slug || "",
                title: item.name || "",
                posterUrl: getImageUrl(item.thumb_url),
                backdropUrl: getImageUrl(item.poster_url),
                year: item.year || 0,
                quality: item.quality || "",
                episode_current:
                    item.current_episode ||
                    item.episode_current ||
                    "",
                lang:
                    item.language ||
                    item.lang ||
                    ""
            };
        });

        var currentPage =
            paginate.current_page ||
            paginate.currentPage ||
            1;

        var totalItems =
            paginate.total_items ||
            paginate.totalItems ||
            0;

        var itemsPerPage =
            paginate.items_per_page ||
            paginate.itemsPerPage ||
            24;

        var totalPages =
            paginate.total_page ||
            paginate.totalPages ||
            1;

        if (totalPages === 0 && itemsPerPage > 0) {
            totalPages = Math.ceil(totalItems / itemsPerPage);
        }

        return JSON.stringify({
            items: movies,
            pagination: {
                currentPage: currentPage,
                totalPages: totalPages,
                totalItems: totalItems,
                itemsPerPage: itemsPerPage
            }
        });

    } catch (error) {
        return JSON.stringify({
            items: [],
            pagination: {
                currentPage: 1,
                totalPages: 1
            }
        });
    }
}

function parseSearchResponse(apiResponseJson) {
    return parseListResponse(apiResponseJson);
}

function parseMovieDetail(apiResponseJson) {
    try {
        var response = JSON.parse(apiResponseJson);

        var movie =
            response.movie ||
            response.data?.item ||
            response.data ||
            {};

        var rawEpisodes =
            movie.episodes ||
            response.episodes ||
            response.data?.item?.episodes ||
            [];

        var servers = [];

        if (Array.isArray(rawEpisodes)) {

            rawEpisodes.forEach(function(server) {

                var episodes = [];

                var serverItems =
                    server.items ||
                    server.server_data ||
                    [];

                if (Array.isArray(serverItems)) {

                    serverItems.forEach(function(ep) {

                        var embed =
                            ep.embed ||
                            ep.link_embed ||
                            "";

                        var m3u8 =
                            ep.m3u8 ||
                            ep.link_m3u8 ||
                            "";

                        var link = embed || m3u8;

                        if (link) {
                            episodes.push({
                                id: link,
                                name:
                                    ep.name ||
                                    ep.episode_name ||
                                    "",
                                slug:
                                    ep.slug ||
                                    ep.episode_slug ||
                                    ""
                            });
                        }

                    });

                }

                if (episodes.length > 0) {
                    servers.push({
                        name:
                            server.server_name ||
                            server.name ||
                            "Server",
                        episodes: episodes
                    });
                }

            });

        }

        var extractGroup = function(categoryObj, groupName) {

            if (!categoryObj) return "";

            for (var key in categoryObj) {

                var group = categoryObj[key];

                if (
                    group &&
                    group.group &&
                    group.group.name === groupName &&
                    group.list &&
                    group.list.length > 0
                ) {
                    return group.list
                        .map(function(item) {
                            return item.name;
                        })
                        .join(", ");
                }

            }

            return "";
        };

        var extractedYear =
            extractGroup(movie.category, "Năm");

        return JSON.stringify({
            id: movie.slug || "",
            title: movie.name || "",
            posterUrl: getImageUrl(movie.thumb_url),
            backdropUrl: getImageUrl(movie.poster_url),
            description:
                (movie.description ||
                 movie.content ||
                 "").replace(/<[^>]*>/g, ""),

            year:
                parseInt(movie.year || extractedYear) || 0,

            rating:
                parseFloat(movie.view) || 0,

            quality:
                movie.quality || "",

            servers: servers,

            episode_current:
                movie.current_episode ||
                movie.episode_current ||
                "",

            lang:
                movie.language ||
                movie.lang ||
                "",

            casts:
                movie.casts ||
                movie.actor ||
                "",

            director:
                movie.director || "",

            category:
                extractGroup(movie.category, "Thể loại"),

            country:
                extractGroup(movie.category, "Quốc gia"),

            view:
                parseInt(movie.view) || 0,

            status:
                movie.status || ""
        });

    } catch (error) {
        return "{}";
    }
}

function parseDetailResponse(html) {

    try {

        var m3u8Regex =
            /file:\s*["']([^"']+\.m3u8[^"']*)["']|source:\s*["']([^"']+\.m3u8[^"']*)["']|src:\s*["']([^"']+\.m3u8[^"']*)["']|["']([^"']+\.m3u8[^"']*)["']/;

        var match = html.match(m3u8Regex);

        var m3u8 = "";

        if (match) {
            m3u8 =
                match[1] ||
                match[2] ||
                match[3] ||
                match[4];
        }

        if (m3u8) {

            return JSON.stringify({
                url: m3u8,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0",
                    "Referer":
                        "https://embed.streamc.xyz/"
                }
            });

        }

        return "{}";

    } catch (error) {

        return "{}";

    }
}

// FIXED: dùng value thay vì slug
function parseCategoriesResponse() {

    var genres = [
        { name: "Hành Động", value: "hanh-dong" },
        { name: "Phiêu Lưu", value: "phieu-luu" },
        { name: "Hoạt Hình", value: "hoat-hinh" },
        { name: "Hài", value: "phim-hai" },
        { name: "Hình Sự", value: "hinh-su" },
        { name: "Tài Liệu", value: "tai-lieu" },
        { name: "Chính Kịch", value: "chinh-kich" },
        { name: "Gia Đình", value: "gia-dinh" },
        { name: "Giả Tưởng", value: "gia-tuong" },
        { name: "Lịch Sử", value: "lich-su" },
        { name: "Kinh Dị", value: "kinh-di" },
        { name: "Nhạc", value: "phim-nhac" },
        { name: "Bí Ẩn", value: "bi-an" },
        { name: "Lãng Mạn", value: "lang-man" },
        { name: "Khoa Học Viễn Tưởng", value: "khoa-hoc-vien-tuong" },
        { name: "Gây Cấn", value: "gay-can" },
        { name: "Chiến Tranh", value: "chien-tranh" },
        { name: "Tâm Lý", value: "tam-ly" },
        { name: "Tình Cảm", value: "tinh-cam" },
        { name: "Cổ Trang", value: "co-trang" },
        { name: "Miền Tây", value: "mien-tay" },
        { name: "Phim 18+", value: "phim-18" }
    ];

    return JSON.stringify(genres);
}

function parseCountriesResponse() {

    var countries = [
        { name: "Âu Mỹ", value: "au-my" },
        { name: "Anh", value: "anh" },
        { name: "Trung Quốc", value: "trung-quoc" },
        { name: "Indonesia", value: "indonesia" },
        { name: "Việt Nam", value: "viet-nam" },
        { name: "Pháp", value: "phap" },
        { name: "Hồng Kông", value: "hong-kong" },
        { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" },
        { name: "Thái Lan", value: "thai-lan" },
        { name: "Đài Loan", value: "dai-loan" },
        { name: "Nga", value: "nga" },
        { name: "Hà Lan", value: "ha-lan" },
        { name: "Philippines", value: "philippines" },
        { name: "Ấn Độ", value: "an-do" },
        { name: "Quốc gia khác", value: "quoc-gia-khac" }
    ];

    return JSON.stringify(countries);
}

function parseYearsResponse() {

    var years = [];

    for (var i = 2026; i >= 2004; i--) {
        years.push({
            name: i.toString(),
            value: i.toString()
        });
    }

    return JSON.stringify(years);
}

function getImageUrl(path) {

    if (!path) return "";

    if (path.indexOf("http") === 0) {
        return path;
    }

    return "https://img.phimapi.com/" + path;
}

// =============================================================================
// EXPOSE FUNCTIONS
// =============================================================================

window.getManifest = getManifest;
window.getHomeSections = getHomeSections;
window.getPrimaryCategories = getPrimaryCategories;
window.getFilterConfig = getFilterConfig;

window.getUrlList = getUrlList;
window.getUrlSearch = getUrlSearch;
window.getUrlDetail = getUrlDetail;

window.getUrlCategories = getUrlCategories;
window.getUrlCountries = getUrlCountries;
window.getUrlYears = getUrlYears;

window.parseListResponse = parseListResponse;
window.parseSearchResponse = parseSearchResponse;
window.parseMovieDetail = parseMovieDetail;
window.parseDetailResponse = parseDetailResponse;

window.parseCategoriesResponse = parseCategoriesResponse;
window.parseCountriesResponse = parseCountriesResponse;
window.parseYearsResponse = parseYearsResponse;

window.getImageUrl = getImageUrl;
