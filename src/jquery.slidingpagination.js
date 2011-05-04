(function($) {
    var realcurrent = 0;

    Array.prototype.has=function(v){
        for (i=0; i<this.length; i++){
            if (this[i]===v) return true;
        }
        return false;
    }
    

    /* Mustache templates */

    var less_arrow_template = "<a href='#' class='lesspages'>&lt;</a>";
    var more_arrow_template = "<a href='#' class='morepages'>&gt;</a>";
    var numbers_template = "{{#pages}}<a href='./?p={{.}}' class='gopage {{#iscurr}}current{{/iscurr}}'>{{.}}</a>{{/pages}}";
    var all_template = "{{{larrow}}} <span class='containpages'><span class='slider' style='position:relative'>{{{numbers}}}</span><span class='tmp'></span></span> {{{marrow}}}";


    function is_current() {
        return this['.'] === realcurrent;
    };

    /* Computing functions */
    function range(a, n) {
        var array = [];
        for (var i=a; i < n; i++) {
            array.push(i);
        }
        return array;
    }

    function compute_numbers(current, max, display){
        var trailing_side = (display - 1)/2;
        var iteration = [];

        if (max <= 1) {
            // Do nothing
        }
        else if (max <= display) {
            iteration = range(1, max+1);
        }
        else {
            after = current + trailing_side;
            before = current - trailing_side;
            if (after > max) {
                before -= after - max;
                after = max;
            }
            else if (before < 1) {
                after += Math.abs(before) + 1;
                before = 1;
            }
            iteration = range(before, after+1);
        }

        return iteration;
    }


    /* jQuery handlers */

    var methods = {
        init : function (options) {

            var settings = {
                'current': 1,
                'max': 28,
                'display': 9
            };

            if (options) {
                $.extend(settings, options);
            }

            realcurrent = settings['current'];


            return this.each(function(){
            
                var $this = $(this);

                var numbers = compute_numbers(settings['current'],
                                              settings['max'],
                                              settings['display']);
                $this.data('slidingpagination', {
                    'vcurrent': settings['current'],
                    'settings': settings,
                    'current_numbers': numbers
                });

                var view_less_arrow = {};
                var html_less_arrow = Mustache.to_html(less_arrow_template, view_less_arrow);
                var view_more_arrow = {};
                var html_more_arrow = Mustache.to_html(more_arrow_template, view_more_arrow);
                var view_numbers = { pages : numbers, iscurr: is_current };
                var html_numbers = Mustache.to_html(numbers_template, view_numbers);

                var view_all = {
                    larrow: html_less_arrow,
                    marrow: html_more_arrow,
                    numbers: html_numbers
                };
                var all = Mustache.to_html(all_template, view_all);

                $this.html(all);
                $this.children(".lesspages").bind('click', methods.goless);
                $this.children(".morepages").bind('click', methods.gomore);

                $this.children('.containpages').css({
                    'overflow':'hidden',
                    'display': 'inline-block'
                });
            }); 
        },

        goless: function(){
            var widget = $(this).parent();

            /* Grab the stored data for our widget */
            var data = widget.data('slidingpagination');
            /* Compute the next position of the virtual current page */
            var virtual_current = data['vcurrent'] - data['settings']['display'];
            /* Compute the new numbers */
            var n_numbers = compute_numbers(virtual_current,
                                            data['settings']['max'],
                                            data['settings']['display']);

            /* Compute the difference */
            var final_nums = [];
            for (var v=0; v < n_numbers.length; v++) {
                if (!data['current_numbers'].has(n_numbers[v])) {
                    final_nums.push(n_numbers[v]);
                }
            }

            if (final_nums.length == 0) {
                return true;
            }

            data['vcurrent'] = virtual_current;
            data['current_numbers'] = n_numbers;
            widget.data('slidingpagination', data);

            /* Render the "final state" in order to know its width */
            var view_numbers = { pages : n_numbers,  iscurr: is_current };
            var tmpnbrs = Mustache.to_html(numbers_template, view_numbers);
            widget.find(".tmp").html(tmpnbrs);
            var final_size = widget.find('.tmp').width();
            widget.find('.tmp').html('');

            /* Render the following template */
            var view_numbers = { pages : final_nums,  iscurr: is_current };
            var new_html_numbers = Mustache.to_html(numbers_template, view_numbers);

            /* Retrieve the current size of the pages */
            var current_pages = widget.find(".slider");
            var current_size = current_pages.width();

            /* Add it to the DOM */
            var tree = $("<span>"+new_html_numbers+"</span>");
            widget.find(".slider").prepend(tree.html());
            
            /* Grab the final size of the box */
            var normal_size = widget.find('.slider').width();

            /* Compute the difference */
            var diff = Math.abs(normal_size - current_size);

            /* Put the new pages to the left */
            widget.find('.slider').css('left', '-'+diff+'px');

            /* Animate */
            widget.find(".containpages").css("width", current_size);
            widget.find(".containpages").animate({'width': final_size+'px'}, 400);

            widget.find(".slider").animate({
                left: '0px'
            }, 8000, function(){
                var l = final_nums.length;
                $($(this).find('.gopage').slice(-l)).each(function(){
                    $(this).remove();
                });
            });
        },

        gomore: function(){
            var widget = $(this).parent();

            /* Grab the stored data for our widget */
            var data = widget.data('slidingpagination');
            /* Compute the next position of the virtual current page */
            var virtual_current = data['vcurrent'] + data['settings']['display'];
            /* Compute the new numbers */
            var n_numbers = compute_numbers(virtual_current,
                                            data['settings']['max'],
                                            data['settings']['display']);

            /* Compute the difference */
            var final_nums = [];
            for (var v=0; v < n_numbers.length; v++) {
                if (!data['current_numbers'].has(n_numbers[v])) {
                    final_nums.push(n_numbers[v]);
                }
            }

            console.log(final_nums);

            if (final_nums.length == 0) {
                return true;
            }

            data['vcurrent'] = virtual_current;
            data['current_numbers'] = n_numbers;
            widget.data('slidingpagination', data);

            /* Render the following template */
            var view_numbers = { pages : final_nums,  iscurr: is_current };
            var new_html_numbers = Mustache.to_html(numbers_template, view_numbers);

            /* Render the "final state" in order to know its width */
            var view_numbers = { pages : n_numbers,  iscurr: is_current };
            var tmpnbrs = Mustache.to_html(numbers_template, view_numbers);
            widget.find(".tmp").html(tmpnbrs);
            var final_size = widget.find('.tmp').width();
            widget.find('.tmp').html('');

            /* Retrieve the current size of the pages */
            var current_pages = widget.find(".slider");
            var current_size = current_pages.width();

            /* Add it to the DOM */
            var tree = $("<span>"+new_html_numbers+"</span>");
            widget.find(".slider").append(tree.html());
            
            /* Grab the final size of the box */
            var normal_size = widget.find('.slider').width();
            console.log(normal_size);
            console.log(current_size);

            /* Compute the difference */
            var diff = Math.abs(normal_size - current_size);
            console.log(diff);

            /* Put the new pages to the left */
            widget.find('.slider').css('left', '0px');

            /* Animate */
            widget.find(".containpages").css("width", current_size);
            widget.find(".containpages").animate({'width': final_size+'px'}, 400);

            widget.find(".slider").animate({
                left: '-'+(diff-final_size+current_size)+'px'
            }, 800, function(){
                var l = final_nums.length;
                $(this).find('.gopage').slice(0, l).each(function(){
                    $(this).remove();
                });
                widget.find(".slider").css("left", "0px");
            });
            
        }
    }

    /* Dispatch the call to the correct handler */
    $.fn.slidingPagination = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error("Method " + method + " does not exist on jQuery.slidingPagination");
        }
    }

})( jQuery );
