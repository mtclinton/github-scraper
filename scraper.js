const puppeteer = require('puppeteer');

const { CHROME_BIN } = process.env;
const { GITHUB_REPO } = process.env;

const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
    let githubData = {
        social: {
            starCount: 0,
            forkCount: 0,
        },
        commitsCount: 0,
        branches: [],
    }


    const browser = await puppeteer.launch({
        executablePath: CHROME_BIN,
    })

    const page = await browser.newPage()
    let response = await page.goto('https://github.com/' + GITHUB_REPO)

    // If page does not load with a 200 success, close and warn.
    if (response.status() !== 200) {
        console.warn(`GitHub page error: ${response.status()}`)
        await browser.close()
        return
    }


    // Fetch social data
    const starCountEl = await page.$('[href*="/stargazers"]')
    githubData.social.starCount = await page.evaluate(el => el.innerText, starCountEl)
    
    const forkCountEl = await page.$('[href*="/network/members"]')
    githubData.social.forkCount = await page.evaluate(el => el.innerText, forkCountEl)

    // Fetch commit count
    const commitsCountEl = await page.$('[href*="/commits"] strong')
    githubData.commitsCount = await page.evaluate(el => el.innerText, commitsCountEl)

    // Fetch all branches
    response = await page.goto('https://github.com/' + GITHUB_REPO + '/branches/all')

    // If page does not load with a 200 success, close and warn.
    if (response.status() !== 200) {
        console.warn(`GitHub page error: ${response.status()}`)
        await browser.close()
        return
    }

    // Loop over branches and get name
    const branchEls = await page.$$('.branch-name')
    for (let i = 0; i < branchEls.length; i++) {
        const branch = await page.evaluate(el => el.innerText, branchEls[i])
        githubData.branches.push(branch);
    }

    // Print out data
    console.log(githubData)

    await browser.close()
})()
