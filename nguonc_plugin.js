// =============================================================================
// CONFIGURATION & METADATA
// =============================================================================

function getManifest() {
    return JSON.stringify({
        "id": "nguonc",
        "name": "Phim NguonC",
        "version": "2.0.0",
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
        { slug: 'phim-moi-cap-nhat', title: 'Phim Mới', type: 'Grid', path: 'phim-moi-cap-nhat' }
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
        var sort = filters.sort || "updated";

        var baseUrl = "https://phim.nguonc.com/api/films";
        var finalPath = "";

        var mainLists = [
            'phim-le',
            'phim-bo',
            'phim-dang-chieu',
            'tv-shows',
            'phim-moi-cap-nhat'
        ];

        if (mainLists.indexOf(slug) >= 0) {
            finalPath = "/" + slug;
        }
        else if (/^\d{4}$/.test(slug)) {
            finalPath = "/nam-phat-hanh/" + slug;
        }
        else if (filters.year) {
            finalPath = "/nam-phat-hanh/" + filters.year;
        }
        else if (filters.category) {
            finalPath = "/the-loai/" + filters.category;
        }
        else if (filters.country) {
            finalPath = "/quoc-gia/" + filters.country;
        }
        else {
            finalPath = "/the-loai/" + slug;
        }

        var url = baseUrl + finalPath + "?page=" + page;

        if (sort) {
            url += "&sort=" + sort;
        }

        return url;

    } catch (e) {
        return "https://phim.nguonc.com/api/films/phim-moi-cap-nhat?page=1";
    }
}

function getUrlSearch(keyword, filtersJson) {
    var filters = JSON.parse(filtersJson || "{}");
    var page = filters.page || 1;

    return "https://phim.nguonc.com/api/films/search?keyword="
        + encodeURIComponent(keyword)
        + "&page=" + page;
}

function getUrlDetail(slug) {
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
        else if (Array.isArray(data.items)) {
            items = data.items;
        }

        var paginate =
            response.paginate ||
            response.pagination ||
            data.pagination ||
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
            24;

        var totalPages =
            paginate.total_page ||
            paginate.totalPages ||
            Math.ceil(totalItems / itemsPerPage);

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
                    id: ep.link_m3u8 || ep.m3u8 || ep.link_embed || ep.embed,
                    name: ep.name || "",
                    slug: ep.slug || ""
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

            id: movie.slug || "",

            title: movie.name || "",

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

            servers: servers,

            episode_current:
                movie.current_episode ||
                movie.episode_current ||
                "",

            lang:
                movie.language ||
                movie.lang ||
                "",

            category:
                extractNames(movie.category),

            country:
                extractNames(movie.country),

            director:
                extractNames(movie.director),

            casts:
                extractNames(movie.actor || movie.casts),

            view:
                parseInt(movie.view) || 0
        });

    } catch (error) {

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

    } catch (error) {

        return "{}";

    }
}

// =============================================================================
// CATEGORIES
// =============================================================================

function parseCategoriesResponse(apiResponseJson) {

    return JSON.stringify([
        { name: "Hành Động", slug: "hanh-dong" },
        { name: "Phiêu Lưu", slug: "phieu-luu" },
        { name: "Hoạt Hình", slug: "hoat-hinh" },
        { name: "Hài", slug: "phim-hai" },
        { name: "Kinh Dị", slug: "kinh-di" },
        { name: "Viễn Tưởng", slug: "khoa-hoc-vien-tuong" }
    ]);

}

function parseCountriesResponse(apiResponseJson) {

    return JSON.stringify([
        { name: "Âu Mỹ", value: "au-my" },
        { name: "Hàn Quốc", value: "han-quoc" },
        { name: "Nhật Bản", value: "nhat-ban" },
        { name: "Trung Quốc", value: "trung-quoc" },
        { name: "Việt Nam", value: "viet-nam" }
    ]);

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

function extractNames(data) {

    if (!data) return "";

    if (typeof data === "string") {
        return data;
    }

    if (Array.isArray(data)) {

        return data.map(function (i) {
            return i.name || i;
        }).join(", ");

    }

    return "";
}
