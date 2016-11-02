const TASK_STATUS_IN_PROGRESS=0;
const TASK_STATUS_DONE=1;
const TASK_STATUS_COMPLETE=2;

$(document).ready(function(){
    $.nette.init();
    $('.selectpicker').selectpicker('selectAll');

    // noty default options 
    $.noty.defaults = {
        layout: 'topCenter',
        theme: 'relax', // or 'relax'
        dismissQueue: true, // If you want to use queue feature set this true
        template: '<div class="noty_message"><span class="noty_text"></span><div class="noty_close"></div></div>',
        animation: {
            open: "animated bounceInDown", // Animate.css class
            close: "animated bounceOutUp", // Animate.css class
        },
        timeout: "5000", // delay for closing event. Set false for sticky notifications
        force: false, // adds notification to the beginning of queue when set to true
        modal: false,
        maxVisible: 5, // you can set max visible notification for dismissQueue true option,
        killer: false, // for close all notifications before show
        closeWith: ['click'], // ['click', 'button', 'hover', 'backdrop'] // backdrop click will close all notifications
        callback: {
            onShow: function() {
                var notyListCount = $("#noty_topCenter_layout_container li").length;
                if(notyListCount >= 5){
                    var notycloseId = $("#noty_topCenter_layout_container>li:first-child>.noty_bar").attr('id');
                    $.noty.close(notycloseId);
                } 
            },
            afterShow: function() {},
            onClose: function() {},
            afterClose: function() {},
            onCloseClick: function() {},
        },
        buttons: false // an array of buttons
    };
});

$('.selectpicker').on('change', function(){
    var selected = $.map($('.filter-selected').find("option:selected"), function(option) { return option["value"]; });
    if(selected.length == 0){
        $('.filter').prop("disabled", true);
    }else{
        $('.filter').prop("disabled", false);
    }
});

$('.filter').on("click", function(e){
    var thisButton = $(this);
    thisButton.button('loading');
    var selected = $.map($('.filter-selected').find("option:selected"), function(o) { return o["value"]; });
    $.nette.ajax({
        url: "/\www/\homepage/\?do=filterTasks",
        data: {filter: selected},
        success: function(){
            thisButton.button('reset');
        }
    });
});

$('.all-tasks').on('click', '.mark-in-progress', function(e){
    e.preventDefault();
    $(this).html('<i class="fa fa-circle-o-notch fa-spin">');
    taskSpan = $($(this).parents('.task'));
    var taskId = (taskSpan.data('id'));
    if(taskSpan.data('childrenCount') && taskSpan.data('status') == TASK_STATUS_COMPLETE){
        noty({text: "Couldn't mark Task <b>#"+taskId+" In Progress</b>!<br/>Cannot revert a <b>Complete</b> parent to <b>In Progress</b>", type:'warning'});
        $(this).html('<i class="fa fa-check-square-o fa-lg">');
        return;
    }
    $.nette.ajax({
        url: "/\www/\homepage/\?do=markInProgress",
        data: {taskId: taskId},
        success: function(response){
            if(response.result){
                noty({text: "Task <b>#"+taskId+"</b> was marked <b>In Progress</b> successfully.", type:'success'})
                $(this).html('<i class="fa fa-square-o fa-lg">');
                reloadTasks();
            }else{
                noty({text: "Couldn't mark Task <b>#"+taskId+"</b> In Progress!", type:'error'})
                $(this).html('<i class="fa fa-check-square-o fa-lg">');
            }
        }
    });

});

$('.all-tasks').on('click', '.mark-done', function(e){
    e.preventDefault();
    $(this).html('<i class="fa fa-circle-o-notch fa-spin">');
    taskSpan = $($(this).parents('.task'));
    var taskId = (taskSpan.data('id'));
    var action = getAction(taskSpan); // If it has no children mark complete
    $.nette.ajax({
        url: "/\www/\homepage/\?do="+action,
        data: {taskId: taskId},
        success: function(response){
            if(response.result){
                noty({text: "Task <b>#"+taskId+"</b> was marked <b>"+action.slice(4)+"</b> successfully.", type:'success'})
                $(this).html('<i class="fa fa-check-square-o fa-lg">');
                reloadTasks();
            }else{
                noty({text: "Couldn't mark Task <b>#"+taskId+" Done</b>!", type:'error'})
                $(this).html('<i class="fa fa-square-o fa-lg">');
            }
        }
    })
})

/** 
 * @param task <span>
 * @return string: 'markDone' or 'markComplete'
 * */
function getAction(taskSpan){
    if(taskSpan.data('childrenCount')){
        return (taskSpan.data('childrenCompleteCount') == taskSpan.data('childrenCount')) ? 'markComplete' : 'markDone';
    }else{
        return 'markComplete';
    }
}

function reloadTasks(){
    pageNumber = $('.pagination').find('.active').data('pageNumber');
    if(!pageNumber)pageNumber=1;
    $.nette.ajax({url: '/\www/\homepage/\?do=reloadTasks&pageNumber='+pageNumber});
}