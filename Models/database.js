"use strict"
const Sqlite = require('better-sqlite3');
let db = new Sqlite('../Models/db.sqlite');


//----------------------------CHECK IF DATA EXIST +CREATE DATA----------------------------------------

db.prepare("DROP TABLE IF EXISTS likes").run();
db.prepare("DROP TABLE IF EXISTS comment").run();
db.prepare("DROP TABLE IF EXISTS post").run();
db.prepare("DROP TABLE IF EXISTS user").run();
db.prepare("DROP TABLE IF EXISTS reports").run();
db.prepare("DROP TABLE IF EXISTS contact").run();

db.prepare('CREATE TABLE  user(idUser INTEGER   PRIMARY KEY AUTOINCREMENT , name TEXT,email TEXT ,password TEXT ,gender TEXT,biography TEXT,imageprofil TEXT ,grade TEXT ,agreement TEXT)').run();
db.prepare('CREATE TABLE  post(idPost INTEGER PRIMARY KEY AUTOINCREMENT,  idUser INTEGER REFERENCES user(idUser) ON DELETE CASCADE,name TEXT,description TEXT,image TEXT,datePublication TEXT ,day TEXT,month TEXT,heure TEXT,idPage INTEGER ,totalLike INTEGER,totalDislike INTEGER, totalComment INTEGER)').run();
db.prepare('CREATE TABLE likes(idPost INTEGER  REFERENCES post(idPost),idUser INTEGER REFERENCES user(idUser) ON DELETE CASCADE,like INTEGER , dislike INTEGER ,PRIMARY KEY(idUser,idPost))').run();
db.prepare('CREATE TABLE comment(idPost INTEGER  REFERENCES post(idPost),idUser INTEGER REFERENCES user(idUser) ON DELETE CASCADE,author TEXT,content TEXT ,date TEXT)').run();
db.prepare('CREATE TABLE reports(userName TEXT,email TEXT, topic TEXT, reason TEXT, message TEXT, agreement TEXT)').run();
db.prepare('CREATE TABLE contact(name TEXT, email TEXT,message TEST,agreement TEXT) ').run();




//--------------------------------Insert values to database--------------------------------------------
db.prepare("INSERT INTO user(name,email,password,agreement) VALUES ('admin','adnane.test@gmail.com','password','YES')").run();
db.prepare("INSERT INTO user(name,email,password,agreement) VALUES ('Tassadit','tassadit.test@gmail.com','password','YES')").run();
//db.prepare("INSERT INTO post(numberlike,liked,unliked) VALUES ('0','false','false')").run();