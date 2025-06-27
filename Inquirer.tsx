import {InputType} from "./utils";
import prompt from "inquirer";

async function Inquirer() : Promise<void> {
const userInput : string = await prompt([
    {
        type: 'list',
        name: 'inputType',
        message: 'Select input type:',
        choices: [InputType.FILE, InputType.URL],
    },
    {
        type: 'input',
        name: 'input',
        message: 'Enter file path or URL:',
        when: (answers : any) : any => {
            if (answers.inputType === InputType.FILE
                || answers.inputType === InputType.URL) {
                console.log(answers.input);
            }
            return answers.input;
        }
    },
]);
}

module.exports = Inquirer;

