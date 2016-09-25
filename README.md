#Calorie Counting app

##TODO:
1. Make sure all the routes that aren't protected by auth are protected by multi-level auth
2. Consider making the entries routes WHERE clauses use both the id and the uid from the session
3. Protect against case where login and registration forms have empty fields
4. Expand the logError function in db.js to include as many cases as I can find
5. Need to make user filters/reports
7. Need to make user able to change his daily target calories.
