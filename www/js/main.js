const TASK_STATUS_IN_PROGRESS=0;
const TASK_STATUS_DONE=1;
const TASK_STATUS_COMPLETE=2;

$(document).ready(function(){
    $.nette.init();
    $('.selectpicker').selectpicker('selectAll');

    // noty default options 
    $.noty.defaults.layout = 'topCenter';
    $.noty.defaults.theme = 'relax';
    $.noty.defaults.animation = {
        open: "animated bounceInDown", 
        close: "animated bounceOutUp",
    }
    $.noty.defaults.timeout = '4500';
});

function reloadTasks(){
    $.nette.ajax({url: '/\homepage/\?do=reloadTasks'});
}

$('.selectpicker').on('change', function(){
    var selected = $.map($('.filter-selected').find("option:selected"), function(o) { return o["value"]; });
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
        url: "/\homepage/\?do=filterTasks",
        data: {filter: selected},
        success: function(){
            thisButton.button('reset');
        }
    });
});

$('.all-tasks').on('click', '.mark-in-progress', function(e){
    e.preventDefault();
    taskSpan = $($(this).parents('.task'));
    var taskId = (taskSpan.data('id'));
    if(taskSpan.data('childrenCount') && taskSpan.data('status') == TASK_STATUS_COMPLETE){
        noty({text: "Couldn't mark Task #"+taskId+" In Progress!<br/>Cannot revert a <b>Complete</b> parent to <b>In Progress</b>", type:'warning'});
        return;
    }
    $(this).html('<i class="fa fa-circle-o-notch fa-spin">');
    $.nette.ajax({
        url: "/\homepage/\?do=markInProgress",
        data: {taskId: taskId},
        success: function(response){
            if(response.result){
                noty({text: "Task #"+taskId+" was marked In Progress successfully.", type:'success'})
                $(this).html('<i class="fa fa-square-o fa-lg">');
                reloadTasks();
            }else{
                noty({text: "Couldn't mark Task #"+taskId+" In Progress!", type:'error'})
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
        url: "/\homepage/\?do="+action,
        data: {taskId: taskId},
        success: function(response){
            if(response.result){
                noty({text: "Task #"+taskId+" was marked Done successfully.", type:'success'})
                $(this).html('<i class="fa fa-check-square-o fa-lg">');
                reloadTasks();
            }else{
                noty({text: "Couldn't mark Task #"+taskId+" Done!", type:'error'})
                $(this).html('<i class="fa fa-square-o fa-lg">');
            }
        }
    })
})

/** 
 * @param task <span>
 * @return string: 'markDone' or 'markComplete'
*/
function getAction(taskSpan){
    if(taskSpan.data('childrenCount')){
        return (taskSpan.data('childrenCompleteCount') == taskSpan.data('childrenCount')) ? 'markComplete' : 'markDone';
    }else{
        return 'markComplete';
    }
}

$('.allTasks').on('click', '.deleteTask', function(e){
    taskSpan = $($(this).parents('.task'));
    console.log(taskSpan.data('id'));
});

$('#addTaskModal').on('change keyup', '.addTaskName', function(e){
    if($.trim($(this).val())!=''){
        $('.addTaskModalConfirm').prop("disabled", false);
    }else{
        $('.addTaskModalConfirm').prop("disabled", true);
    }
});

$('.addTaskModalConfirm').on('click', function(e){
    var taskName = $('.addTaskName').val();
    var taskParentID = $('.addTaskParentID').val();
    if($.trim(taskParentID)==''){
        taskParentID = 0;
    }

    $.nette.ajax({
        url: "/\homepage/\?do=addTask",
        data: {taskName: taskName, taskParentID: taskParentID},
        success: function(response){
            if(response.result){
                noty({text: "Task was added successfully.", 'type': 'success'});
                reloadTasks();
                $("#addTaskModal").modal("hide");
            }else{
                noty({text: response.msg, 'type': 'error'});
            }
        }
    });
});