import { Service } from 'egg';
import CryptoJS from 'crypto-js';
//import Submission from '../model/submission';

const availableLanguages = [
    'cpp98', 'cpp03', 'cpp11', 'cpp14', 'cpp17', 'cpp20',
    'c99', 'c11', 'c17',
    'nodejs14',
    'scratch3', 'clipcc3'
];

const showFileLanguages = [
    'cpp98', 'cpp03', 'cpp11', 'cpp14', 'cpp17', 'cpp20',
    'c99', 'c11', 'c17',
    'nodejs14'
];

const languageFileExension = {
    'cpp98': 'cpp', 'cpp03': 'cpp', 'cpp11': 'cpp', 'cpp14': 'cpp', 'cpp17': 'cpp', 'cpp20': 'cpp',
    'c99': 'c', 'c11': 'c', 'c17': 'c',
    'nodejs14': 'js',
    'scratch3': 'sb3', 'clipcc3': 'ccproj'
};

class SubmissionService extends Service {
    public checkLanguage(language: string): boolean {
        return availableLanguages.includes(language);
    }

    public generateCodeHash(code: string): string {
        return CryptoJS.MD5(code).toString();
    }

    public getLanguageFileExtension(language: string): string {
        interface IFileExtension {
            [key: string]: string
        };
        return (<IFileExtension>languageFileExension)[language];
    }

    public checkLanguageCanShow(language: string) {
        return showFileLanguages.includes(language);
    }
}

export default SubmissionService;
