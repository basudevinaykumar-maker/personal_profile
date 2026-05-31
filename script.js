const GITHUB_USERNAME = 'basudevinaykumar-maker';
const GITHUB_TOKEN = ''; // Optional: add a GitHub personal access token for higher rate limits
const TIMEZONE_OFFSET = 5.5; // IST is UTC+5:30, set this to your timezone offset in hours

async function fetchGitHubActivity() {
    try {
        const headers = GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {};
        const eventsResponse = await fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`,
            { headers }
        );
        if (!eventsResponse.ok) {
            throw new Error('GitHub API error');
        }
        const events = await eventsResponse.json();
        analyzeGitHubActivity(events);
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        updateMetricsWithDefaultData();
    }
}

function analyzeGitHubActivity(events) {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekEvents = events.filter(event => new Date(event.created_at) >= sevenDaysAgo);
    let streak = 0;
    const activityByDay = {};

    // Format dates consistently as YYYY-MM-DD with timezone adjustment
    events.forEach(event => {
        const eventDate = new Date(event.created_at);
        eventDate.setHours(eventDate.getHours() + TIMEZONE_OFFSET);
        const dateStr = eventDate.toISOString().split('T')[0];
        activityByDay[dateStr] = (activityByDay[dateStr] || 0) + 1;
    });

    // Calculate streak going backward from today with timezone adjustment
    let currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + TIMEZONE_OFFSET);
    for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (activityByDay[dateStr]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }

    const frequency = (thisWeekEvents.length / 7).toFixed(1);
    const activityByDayOfWeek = {};
    events.slice(0, 100).forEach(event => {
        const eventDate = new Date(event.created_at);
        eventDate.setHours(eventDate.getHours() + TIMEZONE_OFFSET);
        const day = eventDate.getDay();
        activityByDayOfWeek[day] = (activityByDayOfWeek[day] || 0) + 1;
    });

    const mostActiveDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        [Object.keys(activityByDayOfWeek).reduce((a, b) => activityByDayOfWeek[a] > activityByDayOfWeek[b] ? a : b)];

    document.getElementById('postsThisWeek').textContent = thisWeekEvents.length;
    document.getElementById('weekProgressBar').style.width = Math.min(thisWeekEvents.length * 10, 100) + '%';
    document.getElementById('currentStreak').textContent = streak + ' days';
    document.getElementById('postingFrequency').textContent = frequency + '/week';
    document.getElementById('mostActiveDay').textContent = mostActiveDay;
    updateActivityChart(activityByDayOfWeek);
}

function updateActivityChart(activityByDayOfWeek) {
    const chart = document.getElementById('activityChart');
    const dayOfWeekMap = [1, 2, 3, 4, 5, 6, 0];
    const bars = chart.querySelectorAll('.chart-bar');
    const maxActivity = Math.max(...Object.values(activityByDayOfWeek), 1);

    bars.forEach((bar, index) => {
        const dayOfWeek = dayOfWeekMap[index];
        const activity = activityByDayOfWeek[dayOfWeek] || 0;
        const percentage = (activity / maxActivity) * 100;
        bar.style.height = Math.max(percentage, 10) + '%';
    });
}

function updateMetricsWithDefaultData() {
    document.getElementById('postsThisWeek').textContent = '5';
    document.getElementById('weekProgressBar').style.width = '50%';
    document.getElementById('currentStreak').textContent = '12 days';
    document.getElementById('postingFrequency').textContent = '4/week';
    document.getElementById('mostActiveDay').textContent = 'Friday';
}

window.addEventListener('load', function() {
    if (GITHUB_USERNAME && GITHUB_USERNAME !== 'your-github-username') {
        fetchGitHubActivity();
    } else {
        updateMetricsWithDefaultData();
    }
});

document.documentElement.style.scrollBehavior = 'smooth';
(function(){
    const navLinks = document.querySelectorAll('.navbar a');
    const header = document.querySelector('header');
    function offset(){ return (header ? header.offsetHeight : 0) + 12; }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e){
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(!target) return;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset();
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    window.addEventListener('scroll', function(){
        const fromTop = window.scrollY + offset() + 6;
        navLinks.forEach(link => {
            const section = document.querySelector(link.hash);
            if(!section) return;
            if(section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop){
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });
})();
