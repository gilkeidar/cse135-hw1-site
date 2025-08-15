<!DOCTYPE html>
<html>
	<head>
		<title>GET Query String</title>
	</head>
	<body>
		<h1 align="center">GET Query String</h1>
		<hr>
		<?php
		# Print query string (unformatted)
		print "<p>Raw Query String: " . $_SERVER['QUERY_STRING'] . "</p>";

		# Print query string (formatted) in a table
		print "<p>Formatted Query String:</p>";
		print "<table><tbody>";
		foreach ($_GET as $key => $value)
			print "<tr><td>$key:</td><td>$value</td></tr>";

		print "</tbody></table>";

		?>
	</body>
</html>
