// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "Phim NguonC",
        "version": "2.0.1",
        "baseUrl": "https://phim.nguonc.com",
        "iconUrl": "https://raw.githubusercontent.com/youngbi/repo/main/plugins/nguonC.png",
        "isEnabled": true,
        "type": "MOVIE",
        "playerType": "embed"
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

function getPrimaryCategories() {
    return JSON.stringify([
        { name: 'Phim đang chiếu', slug: 'phim-dang-chieu' },
        { name: 'Phim lẻ', slug: 'phim-le' },
        { name: 'Phim bộ', slug: 'phim-bo' },
        { name: 'TV Shows', slug: 'tv-shows' },
        { name: 'Hoạt hình', slug: 'hoat-hinh' }
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

        // =========================
        // FILTER ƯU TIÊN
        // =========================

        if (filters.category) {

            return "https://phim.nguonc.com/api/films/the-loai/"
                + filters.category
                + "?page="
                + page;

        }

        if (filters.country) {

            return "https://phim.nguonc.com/api/films/quoc-gia/"
                + filters.country
                + "?page="
                + page;

        }

        if (filters.year) {

            return "https://phim.nguonc.com/api/films/nam-phat-hanh/"
                + filters.year
                + "?page="
                + page;

        }

        // =========================
        // PHIM MỚI
        // =========================

        if (slug === "phim-moi-cap-nhat") {

            return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page="
                + page;

        }

        // =========================
        // DANH SÁCH
        // =========================

        var listSlugs = [
            "phim-dang-chieu",
            "phim-le",
            "phim-bo",
            "tv-shows",
            "subteam"
        ];

        if (listSlugs.indexOf(slug) >= 0) {

            return "https://phim.nguonc.com/api/films/danh-sach/"
                + slug
                + "?page="
                + page;

        }

        // =========================
        // NĂM
        // =========================

        if (/^\d{4}$/.test(slug)) {

            return "https://phim.nguonc.com/api/films/nam-phat-hanh/"
                + slug
                + "?page="
                + page;

        }

        // =========================
        // QUỐC GIA
        // =========================

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

            return "https://phim.nguonc.com/api/films/quoc-gia/"
                + slug
                + "?page="
                + page;

        }

        // =========================
        // MẶC ĐỊNH = THỂ LOẠI
        // =========================

        return "https://phim.nguonc.com/api/films/the-loai/"
            + slug
            + "?page="
            + page;

    }
    catch (e) {

        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";

    }

}

function getUrlSearch(keyword, filtersJson) {

    var filters = JSON.parse(filtersJson || "{}");

    var page = filters.page || 1;

    return "https://phim.nguonc.com/api/films/search?keyword="
        + encodeURIComponent(keyword)
        + "&page="
        + page;

}

function getUrlDetail(slug) {

    if (slug.indexOf("http") === 0) {
        return slug;
    }

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

        }
        else if (Array.isArray(response.items)) {

            items = response.items;

        }
        else if (data.items && Array.isArray(data.items)) {

            items = data.items;

        }

        var paginate =
            response.paginate ||
            response.pagination ||
            (data.params && data.params.pagination) ||
            {};

        var movies = items.map(function (item) {

            return {

                id: item.slug,

                title: item.name,

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
            paginate.totalItemsPerPage ||
            24;

        var totalPages =
            paginate.total_page ||
            paginate.totalPages ||
            Math.ceil(totalItems / itemsPerPage);

        return JSON.stringify({

            items: movies,

            pagination: {

                currentPage: currentPage,

                totalPages: totalPages || 1,

                totalItems: totalItems,

                itemsPerPage: itemsPerPage

            }

        });

    }
    catch (error) {

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
            [];

        var servers = [];

        rawEpisodes.forEach(function (server) {

            var episodes = [];

            var serverItems =
                server.items ||
                server.server_data ||
                [];

            serverItems.forEach(function (ep) {

                episodes.push({

                    id:
                        ep.link_m3u8 ||
                        ep.m3u8 ||
                        ep.link_embed ||
                        ep.embed ||
                        "",

                    name:
                        ep.name ||
                        ep.episode_name ||
                        "",

                    slug:
                        ep.slug ||
                        ep.episode_slug ||
                        ""

                });

            });

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

        return JSON.stringify({

            id:
                movie.slug ||
                "",

            title:
                movie.name ||
                "",

            originName:
                movie.origin_name ||
                "",

            posterUrl:
                getImageUrl(movie.thumb_url),

            backdropUrl:
                getImageUrl(movie.poster_url),

            description:
                (movie.description || movie.content || "")
                .replace(/<[^>]*>/g, ""),

            year:
                parseInt(movie.year) || 0,

            rating:
                parseFloat(movie.view) || 0,

            quality:
                movie.quality || "",

            servers:
                servers,

            episode_current:
                movie.current_episode ||
                movie.episode_current ||
                "",

            lang:
                movie.language ||
                movie.lang ||
                "",

            category:
                extractGroup(movie.category, "Thể loại"),

            country:
                extractGroup(movie.category, "Quốc gia"),

            director:
                movie.director || "",

            casts:
                movie.casts ||
                movie.actor ||
                "",

            view:
                parseInt(movie.view) || 0,

            status:
                movie.status || ""

        });

    }
    catch (error) {

        return "null";

    }

}

function parseDetailResponse(apiResponseJson) {

    try {

        var response = JSON.parse(apiResponseJson);

        var movie =
            response.movie ||
            response.data?.item ||
            {};

        var episodes =
            response.episodes ||
            movie.episodes ||
            [];

        var streamUrl = "";

        if (episodes.length > 0) {

            var firstServer = episodes[0];

            var serverData =
                firstServer.server_data ||
                firstServer.items ||
                [];

            if (serverData.length > 0) {

                streamUrl =
                    serverData[0].link_m3u8 ||
                    serverData[0].m3u8 ||
                    serverData[0].link_embed ||
                    serverData[0].embed ||
                    "";

            }

        }

        return JSON.stringify({

            url: streamUrl,

            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://phim.nguonc.com"
            },

            subtitles: []

        });

    }
    catch (error) {

        return "{}";

    }

}

// =============================================================================
// CATEGORIES
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {

    var genres = [

        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài", slug: "phim-hai" },
        { name: "Hình Sự", slug: "hinh-su" },
        { name: "Tài Liệu", slug: "tai-lieu" },
        { name: "Chính Kịch", slug: "chinh-kich" },
        { name: "Gia Đình", slug: "gia-dinh" },
        { name: "Giả Tưởng", slug: "gia-tuong" },
        { name: "Lịch Sử", slug: "lich-su" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Nhạc", slug: "phim-nhac" },
        { name: "Bí Ẩn", slug: "bi-an" },
        { name: "Lãng Mạn", slug: "lang-man" },
        { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong" },
        { name: "Gây Cấn", slug: "gay-can" },
        { name: "Chiến Tranh", slug: "chien-tranh" },
        { name: "Tâm Lý", slug: "tam-ly" },
        { name: "Tình Cảm", slug: "tinh-cam" },
        { name: "Cổ Trang", slug: "co-trang" },
        { name: "Miền Tây", slug: "mien-tay" },
        { name: "Phim 18+", slug: "phim-18" }

    ];

    return JSON.stringify(genres);

}

function parseCountriesResponse(apiResponseJson) {

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

function parseYearsResponse(apiResponseJson) {

    var years = [];

    for (var i = 2026; i >= 2004; i--) {

        years.push({
            name: i.toString(),
            value: i.toString()
        });

    }

    return JSON.stringify(years);

}

// =============================================================================
// HELPERS
// =============================================================================

function getImageUrl(path) {

    if (!path) return "";

    if (path.indexOf("http") === 0) {
        return path;
    }

    return "https://img.phimapi.com/" + path;
}

function extractGroup(categoryObj, groupName) {

    if (!categoryObj) return "";

    if (Array.isArray(categoryObj)) {

        return categoryObj.map(function (i) {
            return i.name || "";
        }).join(", ");

    }

    for (var key in categoryObj) {

        var group = categoryObj[key];

        if (
            group &&
            group.group &&
            group.group.name === groupName &&
            group.list &&
            group.list.length > 0
        ) {

            return group.list.map(function (item) {
                return item.name;
            }).join(", ");

        }

    }

    return "";

}
