const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();
const PORT = 8000;
const weeks = 15;
const bowlWeeks = 18;

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

const baseUrl = 'https://www.cbssports.com/college-football/scoreboard/FBS/2022/';
const regularUrl = 'regular/';
const bowlUrl = 'postseason/';

async function scrapeWeekScores(week) {
    const url = `${baseUrl}${regularUrl}${week}/`;
    try {
        const response = await axios(url);
        const html = response.data;
        const cheerioInstance = cheerio.load(html);
        const teams = [];
        const scores = [];

        cheerioInstance('.live-update').each(function () {
            const teamElements = cheerioInstance(this).find('.team');
            const team1Name = teamElements.eq(0).find('.team-name-link').text();
            const team2Name = teamElements.eq(1).find('.team-name-link').text();

            teams.push({ team: team1Name });
            teams.push({ team: team2Name });
        });

        cheerioInstance('div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2)').each(function () {
            const teamElements = cheerioInstance(this).find('td.total');
            const team1Score = teamElements.eq(0).text();
            const team2Score = teamElements.eq(1).text();

            scores.push({ score: team1Score });
            scores.push({ score: team2Score });
        });

        const combinedData = [];
        combinedData.push({
            week: 'Week ' + week
        })
        for (let i = 0; i < teams.length; i++) {
            combinedData.push({
                team: teams[i],
                score: scores[i]
            });
        }
        // console.log(`Week ${week} Scores:`, combinedData);
    } catch (error) {
        console.error(`Error scraping week ${week} scores:`, error);
    }
}

async function scrapeBowlScores(week) {
    const url = `${baseUrl}${bowlUrl}${week}/`;
    try {
        const response = await axios(url);
        const html = response.data;
        const cheerioInstance = cheerio.load(html);
        const teams = [];
        const scores = [];
        const bowlNames = [];

        cheerioInstance('.live-update').each(function () {
            const teamElements = cheerioInstance(this).find('.team');
            const team1Name = teamElements.eq(0).find('.team-name-link').text();
            const team2Name = teamElements.eq(1).find('.team-name-link').text();
            const bowlName = teamElements.find('.section series-statement').text();

            bowlNames.push({bowlName});

            teams.push({ team: team1Name });
            teams.push({ team: team2Name });
        });

        cheerioInstance('div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(2)').each(function () {
            const teamElements = cheerioInstance(this).find('td.total');
            const team1Score = teamElements.eq(0).text();
            const team2Score = teamElements.eq(1).text();

            scores.push({ score: team1Score });
            scores.push({ score: team2Score });
        });

        const combinedBowlData = [];
        combinedBowlData.push({
            week: 'Bowls ' + week
        })
        for (let i = 0; i < teams.length; i++) {
            combinedBowlData.push({
                bowl: bowlNames[Math.floor(i / 2)],
                team: teams[i],
                score: scores[i]
            });
        }
        console.log(`Bowl ${week} Scores:`, combinedBowlData);
    } catch (error) {
        console.error(`Error scraping week ${week} scores:`, error);
    }
}

//for (let week = 1; week <= weeks; week++) {
  //  scrapeWeekScores(week);
//}
for (let bowlWeek = 16; bowlWeek <= bowlWeeks; bowlWeek++){
    scrapeBowlScores(bowlWeek);
}
