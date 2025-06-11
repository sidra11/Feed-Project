
const express = require('express');
const app = express();
app.use(express.json());

const books = [{id:1, title:'badguy', }, {id:2, title:'badguy2', },{id:3, title:'badguy3', }]

app.get('/', (req,res) => {

    return res.send('Home Page');

});

app.get('/api/books', (req,res) => {
  return res.send(books);
    });



    app.post('/api/books', (req, res) => {
        const book = { id: books.length + 1,
            title: req.body.title
        };
       books.push(book);
       res.send(book);
       return;
    });
    app.delete('/api/books/:id', (req, res) => {
        const book = books.find( item => item.id === parseInt(req.params.id));
        if(!book) {res.status(404).send('The course ith the given ID')};
        const index = books.indexOf(book, 1);
        books.splice(index,1);
        res.send(book);
        return;
    })

    // app.get('/api/books', (req, res) => {
    //     const book = books.find( item => item.id === parseInt(req.params.id));
    //     if(!book) {res.status(404).send('The course ith the given ID')};
    // });
  
// })
app.listen(3000, () => console.log('listen port 3000'));
