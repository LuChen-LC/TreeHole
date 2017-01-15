/**
 * Created by Administrator on 2017/1/10.
 */
$(function(){
    //表单验证用户名由2-6个汉字/字母/数字组成
    var testName = /^[\u4E00-\u9FA5a-z0-9A-Z]{2,6}$/;
    //密码由6~12个数字和字母组合而成
    var testPassword = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/;
    //标题不能为空
    var testTitle = /^(\s)+$/;
    //登录表单验证
    $('.logName').keydown(function () {
        var logNameVal = $('.logName').val();
        if(testName.test(logNameVal)){
            $('#logName').html('');
            $('#login').attr('disabled','');
        }else{
            $('#logName').css('color','red').html('树洞名由2-6个汉字/字母/数字组成');
            $('#login').attr('disabled','disabled');
        }
    });
    $('.logPsd').keydown(function () {
        var logPsdVal = $('.logPsd').val();
        if(testPassword.test(logPsdVal)){
            $('#logPsd').html('');
            $('#login').removeAttr('disabled');
        }else{
            $('#logPsd').css('color','red').html('钥匙由6~12个数字和字母组合而成');
            $('#login').attr('disabled','disabled');
        }
    });
    //注册表单验证
    $('.regName').keydown(function () {
        var regNameVal = $('.regName').val();
        if(testName.test(regNameVal)){
            $('#regName').html('');
            $('#register').attr('disabled','');
        }else{
            $('#regName').css('color','red').html('树洞名由2-6个汉字/字母/数字组成');
            $('#register').attr('disabled','disabled');
        }
    });
    $('.regPsd').keydown(function () {
        var regPsdVal = $('.regPsd').val();
        if(testPassword.test(regPsdVal)){
            $('#regPsd').html('');
            $('#register').attr('disabled','');
        }else{
            $('#regPsd').css('color','red').html('钥匙由6~12个数字和字母组合而成');
            $('#register').attr('disabled','disabled');
        }
    });
    $('.regRePsd').keydown(function () {
        var regRePsdVal = $('.regRePsd').val();
        var regPsdVal = $('.regPsd').val();
        console.log(regPsdVal);
        console.log(regRePsdVal);
        if(regRePsdVal != regPsdVal){
            $('#regRePsd').css('color','red').html('两次密码不一致,请重新输入!');
            $('#register').attr('disabled','disabled');
        }else{
            $('#regRePsd').html('');
            $('#register').removeAttr('disabled');
        }
    })



});