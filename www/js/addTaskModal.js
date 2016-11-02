$('#addTaskModal').on('change keyup', '.addTaskParentId', function(e){
    if($.trim($('.addTaskName').val())!=''){
        if(e.which==13){ // If pressed key was enter
            $('.addTaskModalConfirm').click();
        }    
    }
});

$('#addTaskModal').on('change keyup', '.addTaskName', function(e){
    if($.trim($(this).val())!=''){
        $('.addTaskModalConfirm').prop("disabled", false);
        if(e.which==13){ // If pressed key was enter
            $('.addTaskModalConfirm').click();
        }
    }else{
        $('.addTaskModalConfirm').prop("disabled", true);
    }
});

$('.addTaskModalConfirm').on('click', function(e){
    var taskName = $('.addTaskName').val();
    var taskParentId = $('.addTaskParentId').val();
    if($.trim(taskParentId)==''){
        taskParentId = 0;
    }

    var valid = validateAddTaskModal(taskName, taskParentId);
    if(!valid)return;

    $.nette.ajax({
        url: "/\www/\homepage/\?do=addTask",
        data: {taskName: taskName, taskParentId: taskParentId},
        success: function(response){
            if(response.result){
                noty({text: "Task was added successfully.", type: 'success'});
                reloadTasks();
                $("#addTaskModal").modal("hide");
            }else{
                noty({text: response.msg, type: 'error'});
            }
        }
    });
});

$('#addTaskModal').on('shown.bs.modal', function(){
    $('.addTaskName').focus();
});

$('#addTaskModal').on('hide.bs.modal', function(){
    $('.addTaskModalConfirm').prop("disabled", true);
    $('.addTaskName').val('');
    $('.addTaskParentId').val('');
});

function validateAddTaskModal(taskName, taskParentId){
    if($.trim(taskName) == ''){
        noty({text: 'Cannot leave <b>Task Name</b> empty!', type: 'error'});
        $('.addTaskName').focus();
        return false;
    }
    if(isNaN(taskParentId)){
        noty({text: 'Please insert a valid number in <b>Parent ID</b>!', type: 'error'});
        $('.addTaskParentId').focus();
        return false;
    }
    if(taskParentId < 0){
        noty({text: '<b>Parent ID</b> cannot be negative!', type: 'error'});
        $('.addTaskParentId').focus();
        return false;
    }
    return true;
}
