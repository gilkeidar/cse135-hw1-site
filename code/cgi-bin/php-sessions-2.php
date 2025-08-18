<?php
    session_start();
?>
<!DOCTYPE html>
<html>
    <head>
        <title>PHP Session 2</title>
    </head>
    <body>
        <h1>PHP Sessions Page 2</h1>
        <?php
            print "<p><strong>Name: </strong>";
            if (isset($_SESSION['username'])) {
                //  Avoid XSS
                echo htmlspecialchars($_SESSION['username'], ENT_QUOTES, 'UTF-8');
            }
            else {
                print "You do not have a name set.";
            }
            print "</p>";
        ?>
        <br>
        <br>
        <a href="/cgi-bin/php-sessions-1.php">Sessions Page 1</a>
        <br>
        <a href="/php-cgiform.html">CGI Form</a>
        <br>
        <form style="margin-top: 30px" action="/cgi-bin/php-destroy-session.php"
            method="get">
            <button type="submit">Destroy Session</button>
        </form>
    </body>
</html>