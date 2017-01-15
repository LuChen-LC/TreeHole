/**
 * Created by Administrator on 2017/1/8.
 */
var multer = require('multer');
var storage = multer.diskStorage({
    //设置文件上传路径，文件夹如果不存在会自动创建
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    //给上传的文件重命名
    filename: function (req, file, cb) {
        req.file = file;
        var name = req.session.user.name;
        if (file.mimetype == 'image/jpeg') {
            req.imgUrl = name + '.jpg';
        } else if (file.mimetype == 'image/png') {
            req.imgUrl = name + '.png';
        } else if (file.mimetype == 'image/gif') {
            req.imgUrl = name + '.gif';
        }
        cb(null, req.imgUrl);
    }
});
//添加配置文件到multer对象
var upload = multer({storage: storage});

//导出对象
module.exports = upload;
