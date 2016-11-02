$('.all-tasks').on('click', '.page-link', function(e){
    e.preventDefault();
    var pageNumber = $(this).parent().data('pageNumber');
    $.nette.ajax({
        url: "/\homepage/\?do=pageChange&pageNumber="+pageNumber,
    });
});

$('.all-tasks').on('click', '.page-link-next', function(e){
    e.preventDefault(); 
    pageNumber = $('.pagination').find('.active').data('pageNumber');
    var numberOfPages = $(this).parent().data('numberOfPages');
    if(pageNumber+1 <= numberOfPages){
        $.nette.ajax({
            url: "/\homepage/\?do=pageChange&pageNumber="+(pageNumber+1),
        });
    }
});

$('.all-tasks').on('click', '.page-link-prev', function(e){
    e.preventDefault(); 
    pageNumber = $('.pagination').find('.active').data('pageNumber');
    if(pageNumber-1 >= 1){
        $.nette.ajax({
            url: "/\homepage/\?do=pageChange&pageNumber="+(pageNumber-1),
        });
    }
});