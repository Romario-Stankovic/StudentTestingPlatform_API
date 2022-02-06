import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateStudentDTO } from 'src/dtos/student.dto';
import { Student } from 'src/entities/student.entity';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(Student)
        private readonly repository: Repository<Student>
    ) { }

    async getByID(id: number): Promise<Student | null> {

        let student = await this.repository.findOne(id);

        if (student == undefined) {
            return new Promise(resolve => { resolve(null); });
        }

        return new Promise(resolve => { resolve(student); });

    }

    async getByIndex(index: string): Promise<Student | null> {

        let student = await this.repository.findOne({ where: { indexNumber: index } });

        if (student == undefined) {
            return new Promise(resolve => { resolve(null); });
        }

        return new Promise(resolve => { resolve(student); });
    }

    async add(firstName : string, lastName : string, indexNumber : string, imagePath : string): Promise<Student | null> {

        let newStudent = new Student();
        newStudent.firstName = firstName;
        newStudent.lastName = lastName;
        newStudent.indexNumber = indexNumber;
        newStudent.imagePath = imagePath;

        try {
            let student = await this.repository.save(newStudent);
            return new Promise(resolve => { resolve(student); });
        } catch (error) {
            return new Promise(resolve => { resolve(null); });
        }

    }

    async update(id: number, firstName : string, lastName : string, indexNumber : string): Promise<Student | null> {
        let student = await this.getByID(id);

        if (student == undefined) {
            return new Promise(resolve => { resolve(null); });
        }

        student.firstName = firstName;
        student.lastName = lastName;
        student.indexNumber = indexNumber;

        try {
            let updatedStudent = this.repository.save(student);
            return new Promise(resolve => { resolve(updatedStudent); });
        } catch (error) {
            return new Promise(resolve => { resolve(null); });
        }

    }

}