const axios = require('axios');
const logger = require('../utils/logger');

class RocketService {
    constructor() {
        this.baseURL = 'https://lldev.thespacedevs.com/2.2.0';
    }

    async getUpcomingLaunches(limit = 5) {
        try {
            const response = await axios.get(`${this.baseURL}/launch/upcoming`, {
                params: {
                    limit,
                    ordering: 'net'
                }
            });

            const launches = response.data.results.map(launch => ({
                name: launch.name,
                date: launch.net,
                agency: launch.launch_service_provider?.name || 'Unknown',
                mission: launch.mission?.description || 'No description available',
                location: launch.pad?.location?.name || 'Unknown location',
                url: launch.url || '',
                image: launch.image || null,
                status: launch.status?.name || 'Unknown'
            }));

            logger.info('Rocket launches fetched', { count: launches.length });
            return launches;
        } catch (error) {
            logger.error('Rocket API error', { error: error.message });
            throw new Error(`Failed to fetch rocket launches: ${error.message}`);
        }
    }

    async getLaunchDetails(launchId) {
        try {
            const response = await axios.get(`${this.baseURL}/launch/${launchId}`);
            const launch = response.data;

            return {
                name: launch.name,
                date: launch.net,
                agency: launch.launch_service_provider?.name || 'Unknown',
                mission: launch.mission?.description || 'No description available',
                location: launch.pad?.location?.name || 'Unknown location',
                rocket: launch.rocket?.configuration?.name || 'Unknown rocket',
                url: launch.url || '',
                image: launch.image || null,
                status: launch.status?.name || 'Unknown',
                webcast_live: launch.webcast_live,
                probability: launch.probability
            };
        } catch (error) {
            logger.error('Launch details error', { error: error.message, launchId });
            throw new Error(`Failed to fetch launch details: ${error.message}`);
        }
    }
}

module.exports = RocketService;