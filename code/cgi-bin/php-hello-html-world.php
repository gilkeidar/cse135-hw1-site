<html>
	<head>
		<title>Hello PHP CGI World</title>
	</head>
	<body>
		<h1 align="center">Hello HTML World!</h1>
		<hr>
		<p>Hello World</p>
		<p>This page was generated with the PHP programming language.</p>
		<p>This program was run at: <?php echo date(DATE_RFC2822) ?></p>
		<p>Your current IP Address is: <?php echo $_SERVER['REMOTE_ADDR'] ?></p> 
	</body>
</html>
