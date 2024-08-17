const express = require('express');
const app = express();
const mongoose = require('mongoose');
app.use(express.static('public'))

main().catch(err => console.log(err));

async function main() {
    const atlasMongo = 'mongodb+srv://varun:mongo@mongo.arq87ql.mongodb.net/gita?retryWrites=true&w=majority&appName=mongo';
    await mongoose.connect(atlasMongo);


}

// Setting EJS as the view engine
app.set('view engine', 'ejs');

//defining the schemas for the db
const verseSchema = new mongoose.Schema({
    chapter: Number,
    verse: Number,
    hindi_text: String,
    english_text: String,
    favorite: Boolean,
    commentary: String,
});

const Verse = mongoose.model('Verse', verseSchema);

const chapterSchema = new mongoose.Schema({
    number: Number,
    title: String,
    title_meaning: String,
    description: String,
    verse_count:Number,
});

const Chapter = mongoose.model('Chapter', chapterSchema);

//Rendering index.ejs
app.get('/', async (req, res) => {
    let chapterData =  await Chapter.find().exec();
    res.render('index', {data:chapterData});
});


app.get('/lookup', (req, res) => {
    res.render('lookup',);
});

app.get('/collection', (req, res) => {
    res.render('collection',);
});


//Server is listening on port 5000
app.listen(5000, () => {
    console.log(`App listening at port 5000`);
})





// EVERYTHING BELLOW IS FOR DATA CLEANING/GRABBING AND SENDING TO MONGO DB
// IT IS BASICALLY OF NO MORE USE AFTER RUNNING ONCE



async function req(chap) {
    const url = 'https://bhagavad-gita3.p.rapidapi.com/v2/chapters/'+chap+'/verses/';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '23e2d907b5msh4fbc7b25d325539p1bc5dcjsn0e44d45279ca',
            'x-rapidapi-host': 'bhagavad-gita3.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        let result = await response.text();
        return JSON.parse(result);
    } catch (error) {
        console.error(error);
    }
}

async function reqChaps(){
    const url = 'https://bhagavad-gita3.p.rapidapi.com/v2/chapters/?skip=0&limit=18';
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '23e2d907b5msh4fbc7b25d325539p1bc5dcjsn0e44d45279ca',
            'x-rapidapi-host': 'bhagavad-gita3.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.text();
        return JSON.parse(result)
    } catch (error) {
        console.error(error);
    }
}


//for translations and commentaries
function getSwamiTranslation(trans) {
    return trans.filter(
        function(trans) {return trans.author_name === 'Swami Sivananda'}
    )
}

//for translations and commentaries
function getEnglish(data) {
    return data.filter(
        function(data) {return data.language === 'english'}
    )
}

async function add() {



    //18 chapters

    reqChaps().then(result => {
        // Do something with the result

        //CREATING ALL THE CHAPTER INFOS
        for (let i = 0; i < result.length; i++) {
            console.log('lets create chapter ' + i)

            const chap = Chapter.create({
                number: i+1,
                title: result[i].name_translated,
                title_meaning: result[i].name_meaning,
                description: result[i].chapter_summary,
                verse_count: result[i].verses_count,
            });

        }
        console.log('added chapter ' + i + ' info');



    }).catch(error => {
        console.error('Error:', error);
    });



    //CREATING ALL THE VERSES

    for (let i = 1; i < 19; i++){
        req(i).then(result => {
                console.log('lets create chapter ' + (i))
                for (let j = 0; j < result.length; j++) {
                    const verse = Verse.create({
                        chapter: i,
                        verse: j + 1,
                        hindi_text: result[j].text,
                        english_text: getSwamiTranslation(result[j].translations)[0].description,
                        favorite: false,
                        commentary: 'https://www.holy-bhagavad-gita.org/chapter/' + i + '/verse/' + (j + 1),
                    });

                }
                console.log('added ' + result.length + ' verses to the db in chap ' + i);

        }).catch(error => {
            console.error('Error:', error);
        });

    }

}