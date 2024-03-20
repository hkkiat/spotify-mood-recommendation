SERVER_ADDRESS=http://localhost
./node_modules/.bin/apollo schema:download --endpoint=$SERVER_ADDRESS:8000/graphql client_schema.json
./node_modules/.bin/apollo client:codegen --globalTypesFile=./__generated__/clientGlobalTypesFile.ts --target=typescript --localSchemaFile='./client_schema.json' --includes='./frontend/src/graphql/queries/**/*.ts'