import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.ensureDatabaseExists();
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async ensureDatabaseExists() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('❌ DATABASE_URL no está definida');
    }

    // Extraemos datos de la URL (usuario, contraseña, host, puerto, nombre)
    const match = databaseUrl.match(
      /postgresql:\/\/(.*):(.*)@(.*):(\d+)\/(.*)\?/
    );

    if (!match) {
      throw new Error('❌ DATABASE_URL no tiene un formato válido');
    }

    const [, user, password, host, port, database] = match;

    // Conexión al servidor usando la BD "postgres"
    const adminClient = new Client({
      user,
      password,
      host,
      port: Number(port),
      database: 'postgres',
    });

    await adminClient.connect();

    // Comprobar si la base existe
    const result = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = '${database}';`
    );

    if (result.rowCount === 0) {
      console.log(`⚠️ La base de datos "${database}" no existe. Creándola...`);
      await adminClient.query(`CREATE DATABASE "${database}";`);
      console.log(`✅ Base de datos "${database}" creada con éxito.`);
    }

    await adminClient.end();
  }
}
