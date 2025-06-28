//* Imports

export async function main() {
    await Promise.all([
        //* Initialize
    ]);
}

main();

process.on('unhandledRejection', (error) => {
    console.error(error);
});

process.on('uncaughtException', (error) => {
    console.error(error);
});