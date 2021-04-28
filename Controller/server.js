"use strict"
const express = require('express');
const fs = require('fs');
const mustache = require('mustache-express');
const session = require('express-session');
const { check, validationResult } = require('express-validator');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const model = require('../Models/model.js');
const { error } = require('console');
const bcrypt = require('bcrypt');
                                             // --------------------
var info;
var challenges;
var like = 0;
var dislike = 0;
var idTEST;
var dictionary;
var like_dictionary;
let comment_dictionary;
var niveau = [{ "niveau1": "../niveau1.css" ,"subtitle":"@Begginer"}, { "niveau2": "../niveau2.css","subtitle":"@Amateur" }, { "niveau3": "../niveau3.css","subtitle":"@Intermediare"}, { "niveau4": "../niveau4.css" ,"subtitle":"@Semi-pro" }, { "niveau5": "../niveau5.css","subtitle":"@Professional" }, { "niveau6": "../niveau6.css" ,"subtitle":"@EXPERT"},{ "niveau7": "../niveau7.css" ,"subtitle":"@MASTER","certification":"http://localhost:4000/images/logo-facebook.png"}]
var count =0 ;

                                             // --------------------


const storage = multer.diskStorage({
    destination: '../public/uploads',
    filename: function (req, file, callback) {
        callback(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }

});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, callback) {
        checkFileType(file, callback);
    }

}).single('myImage')

function checkFileType(file, callback) {
    const filestypes = /jpeg|jpg|png|gif/;
    const extensioname = filestypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filestypes.test(file.mimetype);

    if (extensioname && mimetype) {
        return callback(null, true);
    } else {
        return callback("Images ONLY");
    }
}








//----------------Configurationdu serveur----------------------
var app = express();
const port = 4000;
app.use(express.static('../CSS'));
app.use(express.static('../public'));
app.use(cookieSession({
    secret: 'mot-de-passe-cookie',
}));
app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', '../Views');
app.use(bodyParser.urlencoded({ extended: false }));
//---------------------END-------------------------------------

//-----------------Gérer l'authentification de l'utilisateur ---------------------------------

function authenticated(req, res,next){
  if( req.session.user !=undefined) {
    res.locals.authenticated = true;
    return next();
  }
  else{
    res.locals.authenticated = false;
    res.redirect('/register');
  } 
}
function authenticated_home_page(req,res,next){
    if( req.session.user !=undefined) {
        res.locals.authenticated = true;
        return next();
      }
      else{
        res.locals.authenticated = false;
        res.render('homepage')
      } 
}


//----------------Les Routes du serveur -----------------------
                    //-----------------GET-----------------------

app.get('/',authenticated_home_page, (req, res) => {
    if(count==0)req.session.user=null; //si c'est la premiere fois qu'on entre la session est null
    res.render('homepage');
})
app.get('/register', (req, res) => {
    res.render('register');
})
app.get('/challenges',authenticated, (req, res) => {

    fs.readFile('../JsonFiles/challanges.json', function read(err, data) {
        if (err) {
            throw err;
        }
        challenges = JSON.parse(data);
        res.render('challenges', challenges);
    });
})
app.get('/publication/:id',authenticated,(req, res) => {
    idTEST = req.url.substring(13);
    dictionary = model.get_publication(idTEST);
    if (like_dictionary == undefined) {
        dictionary[0] = { "idPage": idTEST };
        for (let element of dictionary) {
            element.like = model.count_likes(element.idPost);
            element.dis_like = model.count_dislikes(element.idPost);
        }
    }
    if (like_dictionary != undefined) {
        for (let element of dictionary) {
            element.like = model.count_likes(element.idPost);
            element.dis_like = model.count_dislikes(element.idPost);
            element.totalComment = model.count_comment(element.idPost);
        }
    }
    res.render('publication', { publication: dictionary });

});

app.get('/new_publication', authenticated,(req, res) => {
    res.render('addpublication');
})
app.get('/update_profil', (req, res) => {
    res.render('updateinfo', info);
})
app.get('/user_profil', authenticated,(req, res) => {
    let userProfil = model.get_userprofil(req.session.user);
    let dictionary = model.userInfo(req.session.user);
    dictionary.file = userProfil;
    res.render('user_profil', dictionary);
})
app.get('/user_profil/:name',authenticated ,(req, res) => {
    var name =unescape(req.url.substring(13));
    var dictionary = model.userprofil(name);
    var dictionnary_publication = model.count_number_publication(model.get_idUser(name));
    switch (dictionnary_publication) {
        case 1:

            model.insert_grade("1", name);
            dictionary.niveau = niveau[0].niveau1;
            dictionary.subtitle=niveau[0].subtitle;
            break;
        case 2:

            model.insert_grade("2", name);
            dictionary.niveau = niveau[1].niveau2;
            dictionary.subtitle=niveau[1].subtitle;
            break
        case 3:
            model.insert_grade("3", name);
            dictionary.niveau = niveau[2].niveau3;
            dictionary.subtitle=niveau[2].subtitle;
            break
        case 4:
            model.insert_grade("4", name);
            dictionary.niveau = niveau[3].niveau4;
            dictionary.subtitle=niveau[3].subtitle;
            break
        case 5:
            model.insert_grade("5",name);
            dictionary.niveau = niveau[4].niveau5;
            dictionary.subtitle=niveau[4].subtitle;
            break;
        case 6:
            model.insert_grade("6",name);
            dictionary.niveau = niveau[5].niveau6;
            dictionary.subtitle=niveau[5].subtitle;
            break;
        case 7:
            model.insert_grade("7",name);
            dictionary.niveau = niveau[6].niveau7;
            dictionary.subtitle=niveau[6].subtitle;
            dictionary.certification=niveau[6].certification;
            break;  
        default:
            dictionary.niveau = "../profilStyle.css"
            break;
    }
    dictionary.name = name;
    res.render('acces_user_profil', dictionary);
})

app.get("/like/:id",authenticated,(req, res) => {
    var current_user = req.session.user;
    var idPost = req.url.substring(6);
    var dis_like = model.get_dislike(current_user, idPost);
    var like = model.get_like(current_user, idPost);
    // model.update_like(current_user,idPost,like+1,dis_like); 
    if(model.get_like(current_user,idPost)==0){
    model.update_like(current_user,idPost,1, 0);
    }
    else if (model.get_like(current_user,idPost)>0){
        model.update_like(current_user, idPost, 0, 0);
        }
    model.insert_like(current_user,idPost,1,0);
    
    
    like_dictionary = { "idPost": idPost, 'idPage': idTEST, 'likeNumber': like, 'dis_like': dis_like };

    res.redirect('/publication/' + like_dictionary.idPage);

})

app.get("/dislike/:id",authenticated,(req, res) => {
    var current_user = req.session.user;
    var idPost = req.url.substring(9);
    var dis_like = model.get_dislike(current_user, idPost);
    var like = model.get_like(current_user, idPost);
    if(dis_like==0){
     model.update_dislike(current_user, idPost, 0,1);
    }
    else if(dis_like>0){
        model.update_dislike(current_user, idPost, 0,0);
       }
    like_dictionary = { "idPost": idPost, "idPage": idTEST, "likeNumber ": like, "dis_like": dis_like };
    res.redirect('/publication/' + like_dictionary.idPage)
})


app.get('/report',authenticated,(req, res) => {
    res.render('report');
})
app.get('/commentaire/:idPost',authenticated,(req, res) => {
    let idPost = req.url.substring(13);
    if (comment_dictionary != '') {
        comment_dictionary = model.get_comment(idPost);
        for (let element of comment_dictionary) {
            element.image_profil = model.get_userprofil(element.idUser);
        }
    }
    if (comment_dictionary == '') comment_dictionary = { "idPost": idPost };
    res.render('commentaire', { commentaire: comment_dictionary });
})

app.get('/reset_password_2', (req, res) => {
    res.render('resetpassword');
})

app.get('/deleteprofil',authenticated,(req, res) => {
    res.render('deleteprofil');
})

app.get('/privacyPolicy',(req, res) => {
    res.render('privacyPolicy');
})
app.get('/contactus',(req, res) => {
    res.render('contactUs')
})

app.get('/aboutus',(req, res) => {
    res.render('aboutUs');
    })

app.get('/logout',authenticated,(req,res)=>{
    req.session=null;
    res.redirect('/');
})

                                //-----------------POST-----------------------

app.post('/register', check('name', "Le nom n'est pas valide").custom((value,{req})=>{
    if(isNaN(value)){
        return true;
    }else{
        throw new Error('invalid name')
    }
}).isLength({ min: 5 }), check('email').isEmail(), check('password', "Mode passe pas valide ").isLength({ min: 8 }),
    async (req, res) => {
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var gender = req.body.gender;
        var agreement = req.body.agreement; //return 'on' if clicked
        var agree;
        const salt = await bcrypt.genSalt();  
        password= await bcrypt.hash(password,salt);
        var id;
        const errors = validationResult(req);

        if(model.get_email(email)!=-1){
          let emailError = {'EmailError':true};
          res.render('register',emailError);
        }
       else if(name.toString().length<5){
            let nameError = {'nameError':true};
            res.render('register',nameError); 
        }
       else  if (!errors.isEmpty()) {
            res.render("register",errors);
        } 
       else if(errors.isEmpty() && agreement == "on") {
            agree = "YES";
            if(gender==2){
                gender="Homme";
            }
            else{
                gender="Femme";
            }
            id = model.create_user(name, email, password, gender, agree);
            req.session.user = id;
            res.redirect("/");
        }
    });
app.post('/', async (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    
    var id = model.login(email);
    try {
    var auth = await  bcrypt.compare(password,model.get_userpassword(id))
    }catch{
    
    }
    var gender = req.body.gender;
    info = model.userInfo(id);
    if (model.get_userprofil(req.session.user) != -1)
        info.file = model.get_userprofil(req.session.user);
    if (id !== -1 && auth) {
        req.session.user = id;
        res.redirect('/challenges');
    } else {
        var erros = {boolean :true};
        res.render('homepage',erros);
    }
});

app.post('/upload',authenticated, (req, res) => {
    upload(req, res, (err) => {
        info.msg = err;
        info.boolean = false;
        if (err) {
            info.boolean = true;
            res.render('user_profil', info);
        } else {
            if (req.file == undefined) {
                info.msg = "No file selected";
                info.boolean = true;
                res.render('user_profil', info);
            } else {
                info.msg = 'File uploaded!';
                info.file = `/uploads/${req.file.filename}`
                info.bolean = true;
                model.save_profil(info.file, req.session.user);
                res.render('user_profil', info)

            }

        }
    })
})

app.post('/update-profil',authenticated,async (req, res) => {
    var id = model.login(info.email);
    model.update_profil(id, req.body.username, req.body.email, req.body.biography);
    //--> to save ours old dictionary that contains image !! 
    info.name = req.body.username;
    info.email = req.body.email;
    info.biography = req.body.biography;
    info.file=model.get_userprofil(id);
    res.render("user_profil", info);
})

app.post('/new_publication',authenticated,(req, res) => {
    let userId = req.session.user;
    let title = req.body.title;
    let description = req.body.description;
    let backgroundImage = req.body.image2;
    res.redirect('publication');


})

app.post('/publication/:id',authenticated,(req, res) => {

    upload(req, res, (err) => {
        const monthNames = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
        "Julliet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"
      ];
        let dictionary = {};
        info = model.userInfo(req.session.user);
        let idUser = req.session.user;
        let idPage = req.url.substring(13);
        let description = req.body.description;
        let nameUser = info.name
        var date = new Date;
        var day = date.getUTCDate();
        let month= monthNames[date.getMonth()];
        let heure = date.getHours() + ":" + date.getMinutes();
        dictionary[0] = { boolean: false, msg: err };
        if (err) {
            dictionary = model.get_publication(idPage);
            dictionary[0] = { boolean: true, msg: err, "idPage": idPage,"day":day,"month":month };
            res.render('publication', { publication: dictionary });
        } else {
            if (req.file == undefined) {
                dictionary = model.get_publication(idPage);
                dictionary[0] = { boolean: true, msg: "No file selected", "idPage": idPage,"day":day,"month":month };
                res.render('publication', { publication: dictionary });
            } else {
                dictionary[0] = { bolean: true, msg: 'File uploaded!', file: `/uploads/${req.file.filename}`, "idPage": idPage};
                model.create_post(idUser, nameUser, description, dictionary[0].file, heure, idPage,day,month);
                dictionary = model.get_publication(idPage);
                res.redirect("/publication/" + idPage);
                res.render("publication", { publication: dictionary });

            }
        }

    })
})

app.post('/commentaire/:idPost',authenticated,(req, res) => {
    var comment = req.body.comment;
    var idUser = req.session.user;
    var idPost = req.url.substring(13);
    var user_image_profil = model.get_userprofil(idUser);
    var user_name = model.userInfo(idUser);
    var date = new Date;
    // Feb 2, 2013 11:32:04 PM faire un system AM PM ? :
    var datecomment = date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + "  ," + date.getHours() + ":" + date.getMinutes();
    model.insert_comment(idPost, idUser, user_name.name, comment, '-1', datecomment);
    comment_dictionary = model.get_comment(idPost);
    for (let element of comment_dictionary) {
        element.image_profil = model.get_userprofil(element.idUser);
    }
    res.render('commentaire', { commentaire: comment_dictionary });
})

app.post('/resetpassword',(req, res) => {
    res.redirect('/reset_password_2')
})

app.post('/reset_password_2',async (req, res) => {
    var current_password = req.body.currentpassword;
    var new_password = req.body.newpassword;
    var confirm_password = req.body.confirmpassword;
    var email_user = req.body.email;
    var auth = await bcrypt.compare(current_password,model.get_password(email_user))
    if (auth && new_password == confirm_password) {
        const salt = await bcrypt.genSalt();
        new_password= await bcrypt.hash(new_password,salt);
        model.reset_password(email_user, new_password);
        res.redirect("/");
    } else {
        res.redirect('/reset_password_2');
    }

})

app.post('/deleteprofil',authenticated,async (req, res) => {
    var reason = req.body.reason;
    var password = req.body.password;
    var userId = req.session.user;
    var email = model.userInfo(userId).email;
    var auth = await bcrypt.compare(password,model.get_password(email))
    if (auth) {
        model.delete_profil(userId);
        res.redirect('/');
    } else {
        res.redirect('/deleteprofil')
    }
})

app.post('/report',authenticated,(req, res) => {
    var userName = req.body.user_name;
    var email = req.body.user_email;
    var topic = req.body.user_topic;
    var reason = req.body.user_reason;
    var message = req.body.user_message;
    var agreement = req.body.agreement;
    if (agreement == "on") agreement = "YES";
    model.add_report(userName, email, topic, reason, message, agreement);
    res.redirect('/');
})
app.post('/contactus',(req, res) => {
    var agree;
    var name = req.body.name;
    var email = req.body.email;
    var message = req.body.message;
    var agreement = req.body.agreement;
    if (agreement == "on") {
        agree = "YES";
    } else {
        agree = "NO";
    }
    model.add_contact_info(name, email, message, agree);
    res.redirect('/')
})





//----------------END-------------------------------------------->
app.listen(port);
