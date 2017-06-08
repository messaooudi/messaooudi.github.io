var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var jsonfile = require('jsonfile')
var fs = require('fs')


var args = process.argv.slice(2);


if (args[0]) {
    fs.access('./' + args[0], (err) => {
        if (err)
            fs.mkdirSync(args[0]);

        scrap(args[0]);
    });
}

function scrap(manga) {

    var baseURL = "http://www.mangapanda.com"
    var mangaFolder = "./" + manga
    var titlesFile = mangaFolder + "/titles.json"

    var args = process.argv.slice(2);
    console.log(args)

    function fetchChaptersTitle(callback) {
        console.log("----------------fetching Titles----------------")
        var chapters = [];
        var titles = [];
        request(baseURL + '/' + manga, function (error, response, html) {
            if (error) {
                callback(error)
            } else {
                var $ = cheerio.load(html);
                $('#chapterlist tr > td:first-child').map(function (index) {
                    chapters.push({ id: index, title: $(this).text(), href: $(this).find("a").attr('href') })
                    titles.push($(this).text())
                })
                jsonfile.writeFile(titlesFile, titles, function (err) {
                })
                callback(null, chapters);
            }
        })
    }

    function fetchChaptersSize(chapters, callback) {
        console.log("----------------fetching Sizes----------------")
        async.eachOf(chapters, function (chapter, index, callback) {
            request(baseURL + chapter.href, function (error, response, html) {
                if (error) {
                    callback(error);
                }
                else {
                    var $ = cheerio.load(html);
                    chapter.size = $("#selectpage select > option:last-child").text();
                    console.log(chapter.title + "---> " + chapter.size)
                    callback(null);
                }
            })
        }, function (error) {
            callback(error, chapters)
        })
    }

    function fetchChaptersImgs(chapters, callback) {
        console.log("----------------fetching Imgs----------------")
        async.eachOf(chapters,
            function (chapter, index, callback) {
                chapter.pages = [];
                async.eachOfSeries(new Array(Number(chapter.size)),
                    function (item, index, callback) {
                        var i = index + 1
                        request(baseURL + chapter.href + "/" + i, function (error, response, html) {
                            if (error) {
                                callback(error);
                            }
                            else {
                                var $ = cheerio.load(html);
                                chapter.pages.push($("#img").attr('src'));
                                console.log(chapter.title + "--->" + index + " : " + $("#img").attr('src'))
                                callback(null);
                            }
                        })
                    },
                    function (error) {
                        jsonfile.writeFile(mangaFolder + "/chapter" + index + ".json", chapter, function (err) {
                        })
                        callback(error)
                    })
            },
            function (error) {
                callback(error, chapters)
            })
    }

    async.waterfall([
        fetchChaptersTitle,
        fetchChaptersSize,
        fetchChaptersImgs
    ],
        function (err, data) {
            if (err) console.log(err)
            console.log(data)
        }
    )
}