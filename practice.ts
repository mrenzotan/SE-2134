let readline = require('readline-sync'); //keep readline.sync for now but not needed in web apps

const FILENAME = 'debts.txt';
const fs = require('fs');

function isNumber(something: number) {
    return !Number.isNaN(something);
}

function displayDebtors() {
    console.log('-'.repeat(100));
    console.log('Dya rn ang mga palautang:');
    const debtors = fs.readFile(FILENAME + 'g', callMeWhenDoneReadingFile).toString();
    console.log(debtors);
    console.log('-'.repeat(100));
}

//error first callback
function callMeWhenDoneWritingFile(error: NodeJS.ErrnoException | null) {
    // truthy check
    if (error) {
        console.log('Something wrong writing the file: ', error.message);
        process.exit(1);
    }
}

function callMeWhenDoneReadingFile(error: NodeJS.ErrnoException | null, contents: Buffer) {
    if (error) {
        console.log('Something wrong reading the file: ', error.message);
    }

    console.log(contents.toString());
    console.log('-'.repeat(100));
}

while (true) {
    const input = readline.question('Who owes you and how much? ');
    // input is name[space]amount
    console.log('The input is', input);

    if (input === 'walang utang') {
        break;
    }

    if (!input.includes(' ')) {
        console.log('Invalid input format');
        continue;
    }

    //array destructuring
    const [_name, amountAsString] = input.split(' ');
    const amount = Number(amountAsString);

    if(isNumber(amount)) {
        //just assume name is okay (actually it can be empty)
        fs.writeFile(FILENAME, input + '\n', { flag: 'a+'}, callMeWhenDoneWritingFile); //blocking and synchronous operation
    }
    else {
        console.log('Amount is not a number');
    }

    displayDebtors()
}