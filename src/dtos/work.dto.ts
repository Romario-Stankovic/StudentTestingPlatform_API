import * as Validator from "class-validator";

export class StartWorkDTO {
    @Validator.IsNumber()
    @Validator.IsNotEmpty()
    studentId : number;

    @Validator.IsNumber()
    @Validator.IsNotEmpty()
    testId : number;
}

export class EndWorkDTO {
    @Validator.IsNumber()
    @Validator.IsNotEmpty()
    workId : number;
}

export class WorkDTO {
    workId : number;
    testName : string;
    startedAt: Date;
    endsAt: Date;
    questions : {id:number}[] = [];

    constructor(workId : number, testName : string, startedAt: Date, endsAt : Date, questions : {id:number}[]){
        this.workId = workId;
        this.testName = testName;
        this.startedAt = startedAt;
        this.endsAt = endsAt;
        this.questions = questions;
    }

}