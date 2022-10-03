CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text ,
    url text not null,
    title text not null,
    likes text DEFAULT 0
);

insert into blogs (author, url,title,likes) values ('test', 'test.com','Hello world from test',2);
insert into blogs (author, url,title,likes) values ('test1', 'test1.com','test1 says hello world',1);