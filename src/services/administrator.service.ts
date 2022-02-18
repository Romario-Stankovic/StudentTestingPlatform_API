import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Administrator } from "src/entities/administrator.entity";
import * as crypto from "crypto";
import { Repository } from "typeorm/repository/Repository";

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator)
        private readonly repository: Repository<Administrator>
    ) { }

    async getByID(id: number): Promise<Administrator | null> {
        let administrator = await this.repository.findOne(id);

        if (administrator == undefined) {
            return new Promise(resolve => { resolve(null); });
        }

        return new Promise(resolve => { resolve(administrator); });

    }

    async getByUsername(username: string): Promise<Administrator | null> {
        let administrator = await this.repository.findOne({ where: { username: username } });

        if (administrator == undefined) {
            return new Promise(resolve => { resolve(null); });
        }

        return new Promise(resolve => { resolve(administrator); });
    }

    async getAll() : Promise<Administrator[] | null>{
        let administrators = await this.repository.find();

        if(administrators.length == 0){
            return new Promise(resolve => {resolve(null)});
        }
        
        return new Promise(resolve => {resolve(administrators)});

    }

    async add(firstName: string, lastName: string, username: string, password: string): Promise<Administrator | null> {

        let hash = crypto.createHash("sha512");
        hash.update(password);
        let hashedPassword = hash.digest("hex").toUpperCase();

        let newAdmin: Administrator = new Administrator();
        newAdmin.firstName = firstName;
        newAdmin.lastName = lastName;
        newAdmin.username = username;
        newAdmin.passwordHash = hashedPassword;

        try {
            let admin = await this.repository.save(newAdmin);
            return new Promise(resolve => { resolve(admin); });
        } catch (error) {
            return new Promise(resolve => { resolve(null); });
        }

    }

    async update(id : number, firstName : string, lastName : string, username : string, password : string) : Promise<Administrator | null> {
        
        let admin = await this.getByID(id);

        if(admin == null) {
            return new Promise(resolve => {resolve(null)});
        }

        admin.firstName = firstName != null ? firstName : admin.firstName;
        admin.lastName = lastName != null ? lastName : admin.lastName;
        admin.username = username != null ? username : admin.username;
        if(password != null){
            let hash = crypto.createHash("sha512");
            hash.update(password);
            let hashedPassword = hash.digest("hex").toUpperCase();
            admin.passwordHash = hashedPassword;
        }

        try {
            let updatedAdmin = await this.repository.save(admin);
            return new Promise(resolve => {resolve(updatedAdmin)});
        }catch(error){
            return new Promise(resolve => {resolve(null)});
        }

    }

    async delete(adminId : number) : Promise<Administrator | null> {

        let admin = await this.getByID(adminId);

        if(admin == null) {
            return new Promise(resolve => {resolve(null)});
        }

        try {
            let deletedAdmin = await this.repository.remove(admin);
            return new Promise(resolve => {resolve(deletedAdmin)});
        }catch (error) {
            return new Promise(resolve => {resolve(null)});
        }

    }

}