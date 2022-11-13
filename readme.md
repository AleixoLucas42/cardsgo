## PERSONAL WEEKEND CHALLENGE

Hello fellow friend, this is just a simple project Kanban where you can add and move cards between 4 steps. I made this challenge to myself just to know if I can do developer things. I started my tech carrer at dev, but last years I`ve been working with infrastructure/sysadmin, cloud architecht and DevSecOps; so think about make this project gathering all the knowledge I have in dev and make on one weekend.
<hr>

### Technology and cool stuff:
- No-IP
- Nginx
- Docker
- Python
- Javascript
- Shellscript
- SQL (mysql)
- Git / Git Hooks
- Bare metal VM (Oracle Always Free)
<hr>

### My manual ci/cd (lol)
- Crontab:
   - `* * * * 2 git -C /home/ubuntu/cardsgo pull;`
- Git Hook:
   - post-merge:
     - `bash ~/cardsgo/build.sh`

Actually, every minute the cronjob run `git pull` in the repository, and when a change is detected, do the git pull and the post-merge bash script.
(I could do with cloudbuild or jenkins, etc... but I made this way just to be fast)
<hr>

Well, this is it, nothing special, and if is usefull for you, you can access [CARDS GO!](http://cardsgo.ddns.net)
<hr>
<p float="left">
   <img src="https://sonarcloud.io/api/project_badges/measure?project=AleixoLucas42_cardsgo&metric=vulnerabilities" alt="vulnerabilities"/>
   <img src="https://sonarcloud.io/api/project_badges/measure?project=AleixoLucas42_cardsgo&metric=bugs" alt="bugs"/>
   <img src="https://sonarcloud.io/api/project_badges/measure?project=AleixoLucas42_cardsgo&metric=security_rating" alt="security_rating"/>
   <img src="https://sonarcloud.io/api/project_badges/measure?project=AleixoLucas42_cardsgo&metric=code_smells" alt="code_smells"/>
   <img src="https://sonarcloud.io/api/project_badges/measure?project=AleixoLucas42_cardsgo&metric=reliability_rating" alt="reliability_rating"/>
</p>