const environments = {
    dev: {
        SmartSocial: 'http://localhost:8080/SmartSocial/api/',
        Cortex: 'http://localhost:8080/admin/api/',
        Server: 'http://localhost:8080/'
    },
    server: {
        SmartSocial: 'https://scl.fh-bielefeld.de/SmartSocial/api/',
        Cortex: 'https://scl.fh-bielefeld.de/admin/api/',
        Server: 'https://scl.fh-bielefeld.de/'
    }
};

const currentEnvironment = 'dev';
const config = environments[currentEnvironment];

export default config;
