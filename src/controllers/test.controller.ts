import { Body, Controller, Delete, Get, HttpException, HttpStatus, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { PostTestDTO, DeleteTestDTO, ModifyTestQuestionsDTO, PatchTestDTO } from "src/dtos/test.dto";
import { Answer } from "src/entities/answer.entity";
import { Question } from "src/entities/question.entity";
import { Test } from "src/entities/test.entity";
import { RoleGuard } from "src/guards/role.guard";
import { AllowToRoles } from "src/misc/allow.role.decorator";
import { APIResponse } from "src/misc/api.response";
import { AnswerService } from "src/services/answer.service";
import { QuestionService } from "src/services/question.service";
import { TestService } from "src/services/test.service";

@Controller("api/test/")
export class TestController {
    constructor(
        private testService: TestService,
        private questionService: QuestionService,
        private answerService: AnswerService
    ) { }

    @UseGuards(RoleGuard)
    @AllowToRoles("administrator", "professor")
    @Get()
    async getTest(@Query("by") by: string, @Query("id") id: number): Promise<Test | Test[] | APIResponse> {
        let test: Test | Test[];

        if (by == "default") {
            test = await this.testService.getByID(id);
        } else if (by == "professor") {
            test = await this.testService.getByProfessorID(id);
        } else {
            throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST);
        }

        if (test == null) {
            return new Promise(resolve => { resolve(APIResponse.NULL_ENTRY); });
        }

        return new Promise(resolve => { resolve(test); });

    }

    @UseGuards(RoleGuard)
    @AllowToRoles("administrator", "student")
    @Get("active")
    async getActiveTests(): Promise<Test[] | APIResponse> {
        let tests = await this.testService.getActive();

        if (tests == null) {
            return new Promise(resolve => { resolve(APIResponse.NULL_ENTRY); });
        }

        return new Promise(resolve => { resolve(tests); });

    }

    @UseGuards(RoleGuard)
    @AllowToRoles("administrator", "professor")
    @Get("questions")
    async getTestQuestions(@Query("id") id: number): Promise<Question[] | APIResponse> {
        let questions = await this.questionService.getByTestID(id);

        if (questions == null) {
            return new Promise(resolve => { resolve(APIResponse.NULL_ENTRY); });
        }

        return new Promise(resolve => { resolve(questions); });
    }

    @UseGuards(RoleGuard)
    @AllowToRoles("administrator", "professor")
    @Post()
    async postTest(@Body() data: PostTestDTO): Promise<Test | APIResponse> {

        let test = await this.testService.add(data.professorId, data.testName, data.duration, data.questionCount, data.startAt, data.endAt);

        if (test == null) {
            return new Promise(resolve => { resolve(APIResponse.SAVE_FAILED); });
        }

        return new Promise(resolve => { resolve(test); });
    }

    @UseGuards(RoleGuard)
    @AllowToRoles("administrator", "professor")
    @Patch()
    async patchTest(@Body() data: PatchTestDTO): Promise<APIResponse> {

        let test = await this.testService.update(data.testId, data.professorId, data.testName, data.duration, data.questionCount, data.startAt, data.endAt);

        if (test == null) {
            return new Promise(resolve => { resolve(APIResponse.SAVE_FAILED); });
        }
        return new Promise(resolve => { resolve(APIResponse.OK); });

    }

    //TODO: Optimize adding/updating/deleting, etc
    @UseGuards(RoleGuard)
    @AllowToRoles("administrator", "professor")
    @Patch("questions")
    async patchQuestions(@Body() data: ModifyTestQuestionsDTO): Promise<APIResponse> {

        let test = await this.testService.getByID(data.testId);

        if (test == null) {
            return new Promise(resolve => { resolve(APIResponse.NULL_ENTRY); });
        }

        for (let question of data.questions) {
            let modifyQuestion: Question;

            if (question.toDelete != null && question.toDelete && question.questionId != null) {
                modifyQuestion = await this.questionService.delete(question.questionId);
                continue;
            }

            if (question.questionId != null) {
                modifyQuestion = await this.questionService.update(question.questionId, question.questionText, question.imagePath);
            } else {
                modifyQuestion = await this.questionService.add(test.testId, question.questionText, question.imagePath);
            }

            if (modifyQuestion == null) {
                continue;
            }

            for (let answer of question.answers) {
                let modifyAnswer: Answer;
                if (answer.toDelete != null && answer.toDelete && answer.answerId != null) {
                    modifyAnswer = await this.answerService.delete(answer.answerId);
                    continue;
                }

                if (answer.answerId != null) {
                    modifyAnswer = await this.answerService.update(answer.answerId, answer.answerText, answer.imagePath, answer.isCorrect);
                } else {
                    modifyAnswer = await this.answerService.add(modifyQuestion.questionId, answer.answerText, answer.imagePath, answer.isCorrect);
                }

                if (modifyAnswer == null) {
                    continue;
                }

            }

        }

        return new Promise(resolve => { resolve(APIResponse.OK); });
    }

    @UseGuards(RoleGuard)
    @AllowToRoles("administrator", "professor")
    @Delete()
    async deleteTest(@Body() data: DeleteTestDTO): Promise<APIResponse> {

        let test = await this.testService.delete(data.testId);

        if (test == null) {
            return new Promise(resolve => { resolve(APIResponse.DELETE_FAILED); });
        }

        return new Promise(resolve => { resolve(APIResponse.OK); });
    }

}