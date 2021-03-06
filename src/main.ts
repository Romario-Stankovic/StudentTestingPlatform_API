import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { StorageConfiguration } from './configs/config';

async function main() {
    const port = 4000;
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(StorageConfiguration.mainDestination, {
        prefix: StorageConfiguration.urlPrefix,
        index: false
    });

    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    await app.listen(port);
    console.log(`Server running and listening on port ${port}`);
}
main();
