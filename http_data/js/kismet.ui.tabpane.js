(
  typeof define === "function" ? function (m) { define("kismet-ui-tabpane-js", m); } :
  typeof exports === "object" ? function (m) { module.exports = m(); } :
  function(m){ this.kismet_ui_tabpane = m(); }
)(function () {

"use strict";

var exports = {};

// Flag we're still loading
exports.load_complete = 0;

// Load our css
$('<link>')
    .appendTo('head')
    .attr({
        type: 'text/css', 
        rel: 'stylesheet',
        href: '/css/kismet.ui.tabpane.css'
    });

/* List of objects used to turn into tabs */
var TabItems = new Array();

var TabDiv = null;

/* Add a tab
 *
 * Options is a dictionary which must include:
 *
 * id: id for created div
 * tabTitle: Title show in tab bar
 * createCallback: function called after the div is created, passed the new div
 *
 * priority: order priority in list (optional)
 */
exports.AddTab = function(options) {
    if (!('id' in options) ||
        !('tabTitle' in options) ||
        !('createCallback' in options)) {
        return;
    }

    if (!('priority' in options)) {
        options.priority = 0;
    }

    if (!('expandable' in options)) {
        options.expandable = false;
    }

    options.expanded = false;

    TabItems.push(options);
};

exports.RemoveTab = function(id) {
    for (var x = 0; x < TabItems.length; x++) {
        if (TabItems[x].id = id) {
            TabItems.splice(x, 1);
        }
    }
}

function createListCallback(c) {
    return function() {
        c.createCallback();
    };
}

function populateList(div) {
    TabDiv = div;

    TabItems.sort(function(a, b) {
        if (a.priority < b.priority)
            return -1;
        if (a.priority > b.priority)
            return 1;

        return 0;
    });

    div.empty();

    var ul = $('<ul>', {
            id: 'tabpane_ul'
        });

    div.append(ul);

    for (var i in TabItems) {
        var c = TabItems[i];

        var title = c.tabTitle;;

        if (c.expandable) {
            title += ' <i class="fa fa-expand pseudolink"></i>';
        }

        ul.append(
            $('<li>', { })
            .append(
                $('<a>', {
                    href: '#' + c.id
                })
                .html(title)
            )
        );

        if (c.expandable) {
            $('i', ul).on('click', function() {
                MoveToExpanded(c);
            });
        }

        var td = 
            $('<div>', {
                id: c.id
            });

        div.append(td);

        c.createCallback(td);
    }

    div.tabs({
        heightStyle: 'fill',
        activate: function(e, ui) {
            var id = $('a', ui.newTab).attr('href');
            kismet.putStorage('kismet.base.last_tab', id);
        }
    });

    var lasttab = kismet.getStorage('kismet.base.last_tab', '');
    $('a[href="' + lasttab + '"]', div).click();
}

function MoveToExpanded(tab) {
    var div = $('div#' + tab.id, TabDiv);

    console.log(div);

    tab.jspanel = $.jsPanel({
        id: 'tab_' + tab.id,
        headerTitle: tab.tabTitle,
        headerControls: {
            iconfont: 'jsglyph',
        },
        onclosed: function() {
            this.content.contents().appendTo(div);
        },
    });

    div.contents().appendTo(tab.jspanel.content);
}

// Populate the sidebar content in the supplied div
exports.MakeTabPane = function(div) {
    populateList(div);
};

// We're done loading
exports.load_complete = 1;

return exports;

});
