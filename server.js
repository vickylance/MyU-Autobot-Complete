var restify = require('restify');
var builder = require('botbuilder');

//LUIS AI app model for MyU
var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v1/application?id=3441c805-65b1-4cc0-8b5e-e6c92b747ca8&subscription-key=c9ad898006c6426d95251f015167aaa1&q=');
var dialog = new builder.IntentDialog({
    recognizers: [recognizer]
});

//------ Bot Connector - START ------//
// Get secrets from server environment
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector, {
    localizerSettings: {
        botLocalePath: "./node_modules/botbuilder/lib/locale",
        defaultLocale: "en"
    }
});
// Setup Restify Server
var server = restify.createServer();
// Handle Bot Framework messages
server.post('/api/messages', connector.listen());
// Serve a static web page
server.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log('%s listening to %s', server.name, server.url);
});
//------ Bot Connector - END ------//

// //------ Console Connector - START ------//
// var connector = new builder.ConsoleConnector().listen();
// var bot = new builder.UniversalBot(connector, {
//     localizerSettings: {
//         botLocalePath: "./node_modules/botbuilder/lib/locale",
//         defaultLocale: "en"
//     }
// });
// // Setup Restify Server
// var server = restify.createServer();
// // Serve a static web page
// server.get(/.*/, restify.serveStatic({
//     'directory': '.',
//     'default': 'index.html'
// }));
// server.listen(process.env.port || process.env.PORT || 3978, process.env.IP || process.env.ip, function() {
//     console.log('%s listening to %s', server.name, server.url);
// });
// //------ Console Connector - END ------//

var availableInsuranceTypes = ["Car", "Bike", "Health", "Term", "Child", "Investment", "Pension"];
var typeOfInsurance = "";
var name;

//Car insurance variables
var carRegNo;
var carModel;
var cngLpgFitted;
var isInsured;
var carPurchaseDate;
var carRegPlace;
var carRegYear;
var lastTakenClaim;

//Bike insurance variables
var bikeRegNo;

//Health insurance variables
var noOfAdults;
var noOfChild;
var healthDOB;
var healthCity;

//Term insurance variables
var Gender;
var tobaccoUser;
var termAnnualIncome;
var termDOB;
var termCity;

//Child insurance variables
var childDOB;
var parentDOB;
var childGender;
var parentAnnualIncome;
var childCity;

//Investment plan variables
var investAnnualIncome;
var investDOB;
var investCity;

//Pension plan variables
var pensionAnnualIncome;
var pensionDOB;
var pensionCity;

// // Install logging middleware
// bot.use({
//     botbuilder: function (session, next) {
//         if (/^\/log on/i.test(session.message.text)) {
//             session.userData.isLogging = true;
//             session.send('Logging is now turned on');
//         } else if (/^\/log off/i.test(session.message.text)) {
//             session.userData.isLogging = false;
//             session.send('Logging is now turned off');
//         } else {
//             if (session.userData.isLogging) {
//                 console.log('Message Received: ', session.message.text);
//             }
//             next();
//         }
//     }
// });

// Create bot root dialog
bot.dialog('/', [
    function(session) {
        session.send("Let us get you covered with the best insurance policy !\nWe will help you compare Insurance Plans from 24+ Companies !!");
        var style = builder.ListStyle["button"];
        var options = {
            retryPrompt: 'Please select from the available list of policies.',
            listStyle: style
        };
        builder.Prompts.choice(
            session,
            'What type of plan you are looking for?', ["Car", "Bike", "Health", "Term", "Child", "Investment", "Pension"],
            options
        );
    },
    function(session, results) {
        if (results.response) {
            typeOfInsurance = results.response["entity"];
            session.send(["Great lets get you a " + typeOfInsurance + ((results.response["index"] < 5) ? " Insurance." : " Policy."), "Hmm.. so you want a " + typeOfInsurance + ((results.response["index"] < 5) ? " Insurance." : " Policy.")]);
            session.endDialog();
            session.beginDialog('/getName');
        }
        else {
            session.send("Please select an option.");
        }
    }
]);
var temp = false,
    cases;
//Get the full name of the user
bot.dialog('/getName', [
    function(session) {
        if (!temp) {
            builder.Prompts.text(session, ["May I have your name please", "Hi! What is your name?", "By the way i didn't get your name", "May I know how you may be called?"]);
        }
        else {
            switch (cases) {
                case 1:
                    builder.Prompts.text(session, "Please enter your full name 1");
                    break;
                case 2:
                    builder.Prompts.text(session, "Please enter a valid name 1");
                    break;
                case 3:
                    builder.Prompts.text(session, "Please enter your name 1");
                    break;
                default:
                    builder.Prompts.text(session, "Please enter a valid name 2");
            }
        }
    },
    function(session, results) {
        temp = true;
        if (results.response) {
            //This will run for a valid string
            if (isNaN(results.response) && isValid(results.response)) {
                //Lets check if it is a full name
                if (results.response.split(' ').length > 1) {
                    name = results.response;
                    session.send(["Welcome " + name + " it's a pleasure meeting you.", "Hi there,\nit's good to see you, " + name + "."]);
                    session.send("Please answer following few questions, so we can quickly get a quote that suits you!");
                    if (typeOfInsurance == "Car") {
                        session.beginDialog('/carInsurance');
                    }
                    else if (typeOfInsurance == "Bike") {
                        session.beginDialog('/bikeInsurance');
                    }
                    else if (typeOfInsurance == "Health") {
                        session.beginDialog('/healthInsurance');
                    }
                    else if (typeOfInsurance == "Term") {
                        session.beginDialog('/termInsurance');
                    }
                    else if (typeOfInsurance == "Child") {
                        session.beginDialog('/childInsurance');
                    }
                    else if (typeOfInsurance == "Investment") {
                        session.beginDialog('/investmentPolicy');
                    }
                    else if (typeOfInsurance == "Pension") {
                        session.beginDialog('/pensionPolicy');
                    }
                }
                else {
                    cases = 1;
                    session.beginDialog('/getName');
                }
            }
            else {
                cases = 2;
                session.beginDialog('/getName');
            }
        }
        else {
            cases = 3;
            session.beginDialog('/getName');
        }
    }
]);

bot.dialog('/carInsurance', [
    function(session) {
        var style = builder.ListStyle["button"];
        var options = {
            retryPrompt: 'Please select from the available list of options.',
            listStyle: style
        };
        builder.Prompts.confirm(session,"We hope you didn't do any claim this year",options);
    },
    function(session, results) {
        if(results.response){
            console.log(results.response);
        }
        else{
            session.send("Please select an option.");
        }
    }
]);

bot.dialog('/bikeInsurance', [
    function(session) {
        
    },
    function(session, results) {

    }
]);

bot.dialog('/healthInsurance', [
    function(session) {

    },
    function(session, results) {

    }
]);

bot.dialog('/termInsurance', [
    function(session) {

    },
    function(session, results) {

    }
]);

bot.dialog('/childInsurance', [
    function(session) {

    },
    function(session, results) {

    }
]);

bot.dialog('/investmentPolicy', [
    function(session) {

    },
    function(session, results) {

    }
]);

bot.dialog('/pensionPolicy', [
    function(session) {

    },
    function(session, results) {

    }
]);

function isValid(str) {
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str);
}


// bot.dialog('/getModel', [
//     function (session) {
//         builder.Prompts.confirm(session,'Are you fan of German car manufacturer?');
//     },
//     function (session, results) {
//         if (results.response) {
//             session.beginDialog('/ChooseGerman');
//         } 
//         else {
//             session.beginDialog('/getJapan');
//         }
//     }
// ]);

// bot.dialog('/ChooseGerman',[
//     function (session) {
//         builder.Prompts.choice(session, 'Then you might own any of these car',["Audi","BWM","Mercedes"]);
//     },
//     function(session,results){
//         if (results.response){
//             carModel = results.response["entity"];
//             session.beginDialog('/getPDate');
//         }
//     }
// ]);
    
// bot.dialog('/getJapan',[
//     function(session) {
//         builder.Prompts.confirm(session,"Then you might be Japanese Manufacturer fan");
//     },
//     function(session,results) {
//         if(results.response){
//             session.beginDialog('/JapanChoose');
//         }
//         else {
//         session.beginDialog('/OtherCar');
//         }
//     }
// ]);

// bot.dialog('/JapanChoose',[
//     function(session) {
//         builder.Prompts.choice(session, 'I hope You might own any of these',["Honda","Toyota","Suzuki"]);
//     },
//     function(session,results) {
//         if (session.results)
//         {
//             carModel = results.response["entity"];
//             session.beginDialog('/getPDate');
//         }
//         else
//         {
//             session.beginDialog('/OtherCar');
//         }
//     }
// ]);

// bot.dialog('/OtherCar', [
//     function(session){
//         builder.Prompts.text(session, 'Who is the Manufacturer of your car...');        
//     },
//     function(session,results){
//         carModel = results.response["entity"];
//         session.beginDialog('/getPDate');
//     }
// ]);

// bot.dialog('/getPDate', [
//     function (session) {
//     builder.Prompts.time(session, "When did you purchase your car? Please enter your date format as DD-MM-YYYY");
//   },
//     function (session, results) {
//     if (results.response) {
//         carPDate = new Date(results.response["resolution"]["start"]);
//         session.beginDialog('/getCost');
//         }
//     else 
//         {
//         session.send('Please prompt valid car model...');
//         session.beginDialog('/getModel');
//         }
//     }
// ]);

// bot.dialog('/getCost', [
//     function (session, args) {
//         builder.Prompts.number(session,'What is the price of your car?', {retryPrompt:"How much you spend on buying a car!"});
//     },
//     function (session, results) {
//         if (results.response) {
//             carCost =  results.response;
//         }
//         session.beginDialog('/getRegNo');
//     }
// ]);

// bot.dialog('/getRegNo', [
//     function (session) {
//         session.send("Please share your vehicle RTO number");
//         session.send("Please find below sample image from which you can find your RTO number");
//         var msg = new builder.Message(session)
//             .attachments([{
//                 contentType: "image/jpeg",
//                 contentUrl: "http://www.team-bhp.com/forum/attachments/indian-car-scene/164039d1248451018t-high-security-registration-plates-hsrp-india-dsc_6975.jpg"
//             }]);
//         session.send(msg);
//         builder.Prompts.number(session,'Your RTO number please...');
//     },    
//     function (session, results) {
//         if (results.response) {
//             carRegNo = results.response;
//             session.beginDialog('/getClaim');
//         }
//     }
// ]);

// bot.dialog('/getClaim', [
//     function (session) {
//         builder.Prompts.confirm(session,"We hope you didn't do any claim this year");
//     },    
//     function (session, results) {
//         if(results.response)
//         {
//         session.send('Good you have not claimed till now.');
//         session.send('Find your details here \n\n Car Model: %s \n\n Cost of your Car: %s \n\n Car Reg No: %s \n\n You purchased car on: %d-%d-%d',carModel,carCost,carRegNo,carPDate.getDate(),carPDate.getMonth()+1,carPDate.getFullYear());
//         }
//         else {
//         session.send('Find your details here \n\n Car Model: %s \n\n Cost of your Car: %s \n\n Car Reg No: %s \n\n You purchased car on: %d-%d-%d',carModel,carCost,carRegNo,carPDate.getDate(),carPDate.getMonth()+1,carPDate.getFullYear());
//         }
//     }
// ]);