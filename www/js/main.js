$('.checkbox-mark-done').on('change', function(event){
    var id = $(this).data('taskId');

    if($(this).prop('checked')){
        var url = '/\homepage/\?do=MarkDone';
        var msg = "Done";
    }else{
        var url = '/\homepage/\?do=MarkInProgress';
        var msg = "In Progress";
    }

    $.nette.ajax({
        url: url,
        data: {taskID: id},
        success: function(result){
            if(result){
//                noty({text: 'Task #'+id+' was marked '+msg+' Successfully!'});
            }else{
//                noty({text: 'Failed to mark Task #'+id+' '+msg+'!'});
            }
        }
    });
});