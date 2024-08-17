const mongoose = require('mongoose');

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

main().catch(err => console.log(err));

async function main() {
    const atlasMongo = 'mongodb+srv://varun:mongo@mongo.arq87ql.mongodb.net/gita?retryWrites=true&w=majority&appName=mongo';
    await mongoose.connect(atlasMongo);

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
            console.log('added chapter ' + i + ' info')


            //CREATING ALL THE VERSES
            /*
            console.log('lets create chapter ' + i)
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
            console.log('added ' + result.length + ' verses to the db in chap ' + i)

             */

        }).catch(error => {
            console.error('Error:', error);
        });


    }





// following code made sure that every verse of each chapter included a translation by swami sivananda


/*
const noSivas = [];
for (let j=1; j<19;j++) {
    req(j).then(result => {
        // Do something with the result
        for (let i = 0; i < result.length; i++) {

            if (sivaCheck(result[i].translations) !== null) {
                noSivas.push(sivaCheck(result[i].translations));
            }

        }
        console.log(j)
        console.log(noSivas);

    }).catch(error => {
        console.error('Error:', error);
    });
}

function sivaCheck(trans){
    const siva = trans.filter(
        function(trans) {return trans.author_name === 'Swami Sivananda'}
    )

    if (siva.length > 0){
        return null;
    } else{
        return [verse.chapter_number, verse.verse_number];
    }
}


 */
