const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const hostURL = 'localhost:5000';
var session = require('express-session');
const app = express();

var methodOverride = require('method-override')

//promise
mongoose.Promise = global.Promise;
const keys = require('./config/keys');

//connet to mongoose
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
    .then(() => console.log('Mongo is connected'))
    .catch(err => console.log(err));


// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
//session var middleware
app.use(session({secret:'XASDAasdiuDA',saveUninitialized: true,resave: true}));

    //body parser middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());


//load ideamodel
require('./models/ideas');
require('./models/urls');
require('./models/persons');
require('./models/tests');
require('./models/users');




const Idea = mongoose.model('ideas');
const Url = mongoose.model('urls');
const Person = mongoose.model('persons');
const Test = mongoose.model('tests');
const User = mongoose.model('users');

//


//set storage engiene
const storage = multer.diskStorage({
    destination: './public/uploads/',
   
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // cb(null,file.originalname+ '-' + Date.now() + path.extname(file.originalname));

    }
});

//init upload
const upload = multer({
    storage: storage
}).single('myFile');


//starts ejs
app.set('view engine', 'ejs');

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/views", express.static(path.join(__dirname, 'views')));

app.use(express.static("./views"));




app.get('/', (req, res) => {
testSession = req.session;
    //DATABASE TO ARRAY
    Test.find({}, (err, tests) => {
        if (err) return console.log(err);

        res.render('index', { 
            tests: tests,
            email: testSession.email,
            auth: testSession.auth                 
        });
    });

    console.log(testSession.email);
});


app.get('/results/:id', (req, res) => {
    testSession = req.session;

    Test.findOne({_id: req.params.id},(err,test)=>{
        console.log(req.params.id);

        res.render('results', { 
            test: test,
            email: testSession.email,
            auth: testSession.auth
        });
    })
    
});



app.get('/login',(req,res) => {
   res.render('login');
});


app.post('/login',(req,res) => {
    testSession = req.session;
    testSession.email = "coolQ@Qcool.com";
    

    try {
        // var idString = req.params.id;
        // var id = new mongoose.Types.ObjectId(String(idString));

    
        User.findOne({email: req.body.email},(err,user)=>{
            console.log(user);
            if(user.password == req.body.password){
                testSession.email = user.email;
                testSession.name = user.name;
                testSession.auth = "true";
                console.log("auth succesful");
                res.redirect("/");
            
        }});
        
    } catch (err) {
        console.log(err);
    }


});

//for downloads
app.post('/download', function (req, res) {
    try {
        let file = __dirname + '/public/uploads/'+req.body.title;
    console.log(file);
    res.download(file); // Set disposition and send it.
    } catch (error) {
        
    }
    
});

app.get('/mySurveys', (req, res) => {
    testSession = req.session;
    
    if(testSession.auth=='true'){

        try {
        //DATABASE TO ARRAY
        Test.find({createdBy: testSession.email}, (err, tests) => {
            if (err) return console.log(err);
    
            res.render('mySurveys', { 
                tests: tests,
                email: testSession.email,
                auth: testSession.auth                 
            });
        });
    
        console.log(testSession.email);
    } catch (error) {
        console.log(error);
    }

                  

}else{
    res.redirect('/login');
}
});

app.get('/finishedSurveys', (req, res) => {
    testSession = req.session;
    
    if(testSession.auth=='true'){

        try {
        //DATABASE TO ARRAY
        Test.find({}, (err, tests) => {
            if (err) return console.log(err);
    
            res.render('finishedSurveys', { 
                tests: tests,
                email: testSession.email,
                auth: testSession.auth                 
            });
        });
    
        console.log(testSession.email);
    } catch (error) {
        console.log(error);
    }

                  

}else{
    res.redirect('/login');
}
});

app.get('/test/:id', function (req, res) {
   
    testSession = req.session;

    if(testSession.auth=='true'){

        try {
            // var idString = req.params.id;
            // var id = new mongoose.Types.ObjectId(String(idString));
    
        
            Test.findOne({_id: req.params.id},(err,test)=>{
                console.log(req.params.id);
    
                console.log(test);
                res.render('test', { 
                    test: test,
                    email: testSession.email
                });
            })
        } catch (error) {
            console.log(error);
        }
    }else{
        res.redirect('/login');
    }
});


app.post('/submitTest/:id', (req, res) =>{
   console.log("submitted");
   console.log(req.body.takenBy);
   testSession = req.session;
   if(testSession.auth=='true'){

    try {
        Test.findOne({_id: req.params.id},(err,test)=>{
            console.log(req.params.id);
            
        }).then(test => {
            var taken = false;
            //test.name = req.body.title;
            //test.details = req.body.details;
            for(var i = 0; i< test.takenBy.length;i++){
                if(test.takenBy[i].takenBy == testSession.email){
                    taken=true;
                }
            
            }
            if((test.repeatable==true && taken ==false) || (test.repeatable==true && taken ==true) || (test.repeatable==false && taken == false)){
                
            
                takenBy = {
                    takenBy: req.body.takenBy,
                    answers: req.body.group
                }
                test.takenBy.push(takenBy);
                for(var i = 0; i< test.numOfQuestions;i++){
                    if(req.body.group[i]=='yes'){
                        test.questions[i].yes += 1;
        
                    }
        
                    if(req.body.group[i]=='no'){
                        test.questions[i].no += 1;
        
                    }
                    
                    if(req.body.group[i]=='neutral'){
                        test.questions[i].neutral += 1;
        
                    }
                    console.log(req.body.group[i])
                }
                
        
                test.save()
                .then(test => {
                    console.log(test.questions[0].yes);
                    console.log(test.questions[0].no);
                    console.log(test.questions[0].neutral);
        
                    res.render('results', { 
                        test: test,
                        email: testSession.email,
                        auth: testSession.auth    
                    });
        
        
                })

            }else{
                console.log("you can only take this test once")
                res.redirect("/");
            }
        })
    } catch (error) {
        console.log(error);
    }

                  

}else{
    res.redirect('/login');
}

    

});

app.get('/makeTest', (req, res) => {
    testSession = req.session;

    if(testSession.auth=='true'){

        res.render('makeTest', { 
            email: testSession.email    
        });

                      

    }else{
        res.redirect('/login');
    }
 });

 app.post('/newTest', (req, res) => {
     testSession = req.session;
     console.log("createing new test");
     console.log(testSession.auth);
    if(testSession.auth=='true'){
        try {
            // console.log(req.body.textBox1);
            // console.log(req.body.textBox2);
            // var question;
            // for(var i = req.body.numOfQuestions; i>0; i--){
            //     console.log();
            //     var question:["question"+i]
            // }
            console.log(req.body.commentable);
            console.log(req.body.repeatable);
            var c=false;
            var r=false;
            if(req.body.commentable){
                c=true;
            }
            if(req.body.repeatable ){
                r=true;
            }

            var test = {
                createdBy: testSession.email,
                name: req.body.name,
                repeatable: r,
                commentable: c,
                description: req.body.description,
                numOfQuestions: req.body.numOfQuestions,
                categorie: req.body.categorie,
                questions:[]
            }

            for(var i=0;i<req.body.numOfQuestions;i++){
                var question = {
                    question: req.body.textbox[i]
     
                 }
     
                 test.questions.push(question);
            }
           

            console.log(test);
            new Test(test)
            .save();
            res.redirect("/");
        } catch (error) {
            console.log(error);
        }
   
    }else{
        res.redirect('/login');
    }
});


app.post('/newComment/:id', (req, res) => {
        console.log("submitted");
        console.log(req.body.writtenBy);
        testSession = req.session;
        if(testSession.auth=='true'){
     
         try {
             Test.findOne({_id: req.params.id},(err,test)=>{
                 console.log(req.params.id);

             }).then(test => {
                 //test.name = req.body.title;
                 //test.details = req.body.details;
               
            var comment = {
                writtenBy: testSession.email,
                title: req.body.title,
                text: req.body.text

            }

            test.comments.push(comment);
                 
                 test.save()
                   .then(test => {
                       console.log(test.questions[0].yes);
                       console.log(test.questions[0].no);
                       console.log(test.questions[0].neutral);
         
                       res.redirect("/results/"+test._id);

         
                   })
             })
         } catch (error) {
             console.log(error);
         }
     
                       
     
     }else{
         res.redirect('/login');
     }
     
         
     
  
});


 app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        // cannot access session here
     })
     res.redirect('/login');

 });

 app.get('/registerUser', (req, res) => {
    testSession = req.session;
    //DATABASE TO ARRAY
   

        res.render('registerUser', { 
            
            email: testSession.email,
            auth: testSession.auth                 
        });

  

 });

 app.post('/registerUser', (req, res) => {
    try {
        // console.log(req.body.textBox1);
        // console.log(req.body.textBox2);
        // var question;
        // for(var i = req.body.numOfQuestions; i>0; i--){
        //     console.log();
        //     var question:["question"+i]
        // }
        var uniqueEmail = false;
        var uniqueUsername = false;

        console.log(req.body);
        User.findOne({email: req.body.email},(err,test)=>{

            console.log(test);
            res.render('test', { 
                test: test,
                email: testSession.email
            });
        })
       
        
        var user = {
            name: req.body.name,
            password: req.body.password,
            phone: req.body.phone,
            email: req.body.email,
            religion: req.body.religion,
            party: req.body.party,
            country: req.body.country
        }
        new User(user)
        .save();
        
    } catch (error) {
        
    }
    //navigate to login
    res.redirect('/login');

 });




const port = 5000;

app.listen(port, () => console.log('server started on 5000'));
