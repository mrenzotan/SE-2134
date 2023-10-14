// USING ASYNC AWAIT

import * as fs from 'node:fs/promises';

import * as readLineSync from 'readline-sync';

const FILENAME = 'debts03.txt';

function isNumber(amount: number | string) {
  return !Number.isNaN(amount);
}

async function displayDebtors() {
  try {
    console.log('\n' + '-'.repeat(100) + '\nHere are the list of debtors: ');
    const readFile = await fs.readFile(FILENAME, { encoding: 'utf-8', flag: 'r' });
    console.log(readFile);
  } catch (error) {
    console.log('Something went wrong while reading file: \n', error);
  }
}

async function promptInput() {
  const input: string = readLineSync.question();

  if (input === 'end') {
    return displayDebtors();
  }

  if (!input.includes(' ')) {
    console.log('Invalid input format.');
    return promptInput();
  }

  const inputArr: string[] = input.split(' ');
  const name: string = inputArr[0];
  const amount: number = Number(inputArr[1]);

  if (!isNumber(Number(name)) && isNumber(amount)) {
    try {
      await fs.writeFile(FILENAME, input + '\n', { flag: 'a+' });
      return promptInput();
    } catch (error) {
      console.log('Something went wrong while writing file: \n', error);
    }
  } else {
    console.log('Invalid input. Please try again.');
    return promptInput();
  }
}

console.log('Please input debtor NAME and debtor AMOUNT:');
console.log('Type "end" to stop the program.');
console.log('-'.repeat(100));

promptInput();
