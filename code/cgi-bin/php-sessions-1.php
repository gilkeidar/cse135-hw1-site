<?php
    session_start();
    if (isset($_POST['username'])) {
        $_SESSION['username'] = $_POST['username'];
    }
?>
<!DOCTYPE html>
<html>
    <head>
        <title>PHP Session 1</title>
    </head>
    <body>
        <h1>PHP Sessions Page 1</h1>
        <?php
            print "<p><strong>Name: </strong>";
            if (isset($_SESSION['username'])) {
                print $_SESSION['username'];
            }
            else {
                print "You do not have a name set.";
            }
            print "</p>";
        ?>
        <br>
        <br>
        <a href="/cgi-bin/php-sessions-2.php">Sessions Page 2</a>
        <br>
        <a href="/php-cgiform.html">CGI Form</a>
        <br>
        <form style="margin-top: 30px" action="/cgi-bin/php-destroy-session.php"
            method="get">
            <button type="submit">Destroy Session</button>
        </form>
    </body>
</html>