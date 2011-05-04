# jQuery.SlidingPagination

A simple slide-based pagination plugin for jQuery.


## Requirements

 - jQuery (tested on 1.5.2)
 - [Mustache.js](https://github.com/janl/mustache.js/)


## Example


    <div id="paging">Pagination</div>

    $(document).ready(function() {
        var current = 6;
        var max = 96;

        $("#paging").slidingPagination({
            'current': current,
            'max': max,
        });
    });

