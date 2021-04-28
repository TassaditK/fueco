"use strict"
/* Module de recherche dans une base de recettes de cuisine */
const Sqlite = require('better-sqlite3');
const { body, check } = require('express-validator');
const model = require('../Models/model');
let db = new Sqlite('../Models/db.sqlite');
const session = require('express-validator');

/*-------------------* Cree un uttilisateur  *-------------------*/

function create_user(name, email, password, gender, agreement) {
    let imageprofil;
    if(gender=="Homme"){
        imageprofil='https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Man_Silhouette.png/300px-Man_Silhouette.png';
    }
    else{
        imageprofil='https://tech3lab.hec.ca/wp-content/uploads/2015/08/Unknown-Girl.jpg';
    }
    try {
        let insert = db.prepare(`INSERT INTO user (name,email,password,imageprofil,gender,agreement) VALUES (?,?,?,?,?,?)`);

        let result = insert.run([name, email, password,imageprofil,gender, agreement]);
        return result.lastInsertRowid;
    } catch (e) {
        if (e.code == 'SQLITE_CONSTRAINT_PRIMARYKEY') return -1;
        throw e;
    }
}

function login(email) {
    let select = db.prepare("SELECT idUser FROM user WHERE email = ?  ");
    let result = select.get(email);
    if (result != undefined) return result.idUser;
    else {
        return -1;
    }
}

function userName(email, password) {
    let select = db.prepare("SELECT name FROM user WHERE email = ? AND password = ? ");
    let result = select.get([email, password]);
    if (result != undefined) {
        console.log(result.name);
        return result;
    } else {
        return null;
    }
}

function userInfo(id) {
    let select = db.prepare("SELECT name, email,password,gender,biography FROM user WHERE idUser = ? ");
    let result = select.get(id);
    console.log("result =", result);
    if (result != undefined) {
        return result;
    } else {
        return -1;
    }
}

function update_profil(id, name, email, biography) {
    db.prepare("UPDATE user SET  name = ?,email = ?,biography = ? ,grade = ? WHERE idUser = ?").run(name, email, biography,0,id);
}
function get_email(email){
   let select =db.prepare('SELECT email FROM user WHERE email=?').get(email);
   if(select!=undefined)return select.email;
   return -1 ;
}
/*-------------------* Profil d'uttilisateur  *-------------------*/
function save_profil(imageProfil, idUser) {
    let insert = db.prepare('UPDATE user SET imageProfil=? WHERE idUser= ? ')
    insert.run(imageProfil, idUser);
}

function get_userprofil(idUser) {
    let select = db.prepare('SELECT imageprofil FROM user WHERE idUser = ?');
    let result = select.get(idUser);
    if (result != undefined) return result.imageprofil;
    else return -1;
}

function get_idUser(name) {
    let select = db.prepare('SELECT idUser FROM user WHERE name = ?');
    let result = select.get(name);
    if (result != undefined) return result.idUser;
    else return -1;
}

function userprofil(name) {
    let select = db.prepare('SELECT email ,biography, gender,imageprofil ,grade FROM user WHERE name = ?  ').get(name);
    if (select != undefined) return select;
    else return -1;
}

function insert_grade(grade, name) {
    db.prepare('UPDATE user SET  grade= ? WHERE name= ? ').run(grade, name);
}

function get_userpassword(idUser){
   let select = db.prepare("SELECT password FROM user WHERE idUser =?").get(idUser)
   if(select!=undefined)return select.password;
   else{
       return -1;
   }
}
/*-------------------* Manipuler la page  d'acceuil  *-------------------*/
var array = [];

function update(idPost, userId) {
    var likes = 0;
    var select = "select idUser from likes where idPost= ?";
    var likes = { "like": likes };
    var result = select.get(idPost);

    return likes;
}

function get_password(email) {
    var select = db.prepare('SELECT password from user where email = ?').get(email);
    if (select != undefined) return select.password;
    else {
        return -1;
    }
}

function reset_password(email, new_password) {
    db.prepare('UPDATE user SET password = ? WHERE email = ?').run(new_password, email);
}
/*-------------------* SECTION PUBLICATION  *-------------------*/
function create_post(idUser, name, description, image, heure, idPage,day,month) {
    try {
        let insert = db.prepare("INSERT INTO post(idUser,name,description,image,heure,idPage ,totalLike,totalDislike ,totalComment,day,month) VALUES(?,?,?,?,?,?,?,?,?,?,?)").run([idUser, name, description, image, heure, idPage, 0, 0, 0,day,month]);
        let idPost = db.prepare('SELECT idPost FROM post WHERE idUser= ? AND description = ? AND idPage = ?').get([idUser, description, idPage]);
        let insert2 = db.prepare("INSERT INTO likes(idPost , idUser ,like, dislike) VALUES(?,?,?,?)").run([idPost.idPost, idUser, 0, 0]);
    } catch (e) {
        if (e.code == 'SQLITE_CONSTRAINT_PRIMARYKEY') return -1;
        throw e;
    }
}

function get_publication(idPage) {
    var select = db.prepare('SELECT idPost,idUser,name,description,image,heure,idPage,day,month FROM post  WHERE idPage= ?').all(idPage);
    if (select != undefined) {
        return select;

    } else {
        return -1;
    }
}

function count_number_publication(idUser) {
    var select = db.prepare('SELECT count(*) AS count_publication FROM post WHERE idUser= ?').get(idUser);
    return select.count_publication;
}

function get_like(userID, postID) {
    var select = db.prepare('SELECT like  FROM likes WHERE  idPost = ? AND idUser =?').get([postID, userID]);
    if (select != undefined) return select.like;
    else {
        return 0;
    }
}

function get_dislike(userID, postID) {
    var select = db.prepare('SELECT dislike  FROM likes WHERE  idPost = ? AND idUser =?').get([postID, userID]);
    if (select != undefined) return select.dislike;
    else {
        return 0;
    }
}

function get_table_likes() {
    var select = db.prepare('SELECT * FROM likes').all()
    if (select != undefined) {
        return select;
    } else {
        return 0;
    }
}

function update_like(userID, postID, new_like, new_dislike) {
    db.prepare('UPDATE likes SET like = ? , dislike = ?  WHERE idUser= ? AND idPost = ? ').run(new_like, new_dislike, userID, postID);   
}
function update_dislike(userID, postID, new_like, new_dislike){
     db.prepare('UPDATE likes SET like = ? , dislike = ?  WHERE idUser= ? AND idPost = ? ').run(new_like, new_dislike, userID, postID);
}

function insert_like(userID, postID, new_like, new_dislike) {
    try{
        if (get_like(userID, postID) == 0 || get_dislike(userID, postID) ==0 )
            db.prepare('INSERT INTO likes(idPost,idUser,like,dislike) VALUES(?,?,?,?)').run(postID, userID, new_like, new_dislike);
    }
    catch{
        console.log('SKIP');
    }
}

function count_likes(idPost) {
    let select = db.prepare('SELECT SUM(like) AS totalLike FROM likes WHERE idPost = ?').get(idPost);
    if (select != undefined) {
        db.prepare('UPDATE post SET totalLike= ? WHERE idPost= ?').run(select.totalLike, idPost);
        return select.totalLike;
    } else {
        return 0;
    }
}

function count_dislikes(idPost) {
    let select = db.prepare('SELECT SUM(dislike) AS totaLdislike FROM likes WHERE idPost = ?').get(idPost);
    if (select != undefined) {
        db.prepare('UPDATE  post SET totalDislike= ? WHERE idPost = ? ').run(select.totaLdislike, idPost);
        return select.totaLdislike
    } else {
        return 0;
    }
}
/*-------------------* SECTION commentaire *-------------------*/
function insert_comment(idPost, idUser, name, content, image, date) {
    db.prepare('INSERT INTO comment(idPost,idUser,author , content,date) VALUES(?,?,?,?,?)').run(idPost, idUser, name, content, date)

}

function update_comment(content, idUser) {
    db.prepare('UPDATE comment SET content = ? WHERE idUser = ?').run(content, idUser);

}

function delete_comment(idUser) {
    db.prepare('DELETE FROM comment WHERE idUser = ?)').run(idUser)
}

function get_comment(idPost) {
    let select = db.prepare('SELECT  * FROM comment  WHERE idPost = ? ORDER BY date DESC').all(idPost);
    return select;
}

function count_comment(idPost) {
    let select = db.prepare('SELECT COUNT(*) AS totalComment FROM comment WHERE idPost = ?').get(idPost);
    if (select != undefined) {
        db.prepare('UPDATE  post SET totalComment= ? WHERE idPost = ? ').run(select.totalComment, idPost);
        return select.totalComment
    } else {
        return 0;
    }
}
/*-------------------* SECTION DELETE PROFIL *-------------------*/
function delete_profil(idUser) {
    db.prepare('DELETE  FROM user  WHERE idUser= ?').run(idUser);
}

/*-------------------* REPORT SECTION *-------------------*/
function add_report(userName, email, topic, reason, message, agreement) {
    db.prepare('INSERT INTO reports(userName,email,topic,reason,message,agreement) VALUES(?,?,?,?,?,?)').run(userName, email, topic, reason, message, agreement);
}

/*-------------------* Contact US * --------------------*/
function add_contact_info(name, email, message, agreement) {
    db.prepare('INSERT INTO contact(name,email,message,agreement) VALUES(?,?,?,?)').run(name, email, message, agreement);
}

/*-------------------* All moduls exports *-------------------*/
module.exports = {
    create_user,login,userName,
    userInfo,update, create_post,
    update_profil, get_publication,save_profil,
    get_userprofil,get_idUser, get_userprofil,
    get_like,get_dislike,update_like,
    count_likes,count_dislikes,update_dislike,
    get_table_likes,insert_comment,update_comment,
    delete_comment,userprofil, get_comment,
    count_comment,count_number_publication,insert_grade,
    get_password,reset_password, delete_profil,add_report,
    get_userpassword,add_contact_info,insert_like,get_email
}
