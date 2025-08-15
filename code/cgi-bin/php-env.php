<!DOCTYPE html>
<html>
	<head>
		<title>Environment Variables</title>
	</head>
	<body>
		<h1 align="center">Environment Variables</h1>
		<hr>
		<ul>
		<?php
			foreach ($_SERVER as $property => $value)
				print "<li>$property: $value</li>";
		?>
		</ul>
	</body>
</html>
