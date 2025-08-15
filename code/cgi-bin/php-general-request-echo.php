<!DOCTYPE html>
<html>
	<head>
		<title>General Request Echo</title>
	</head>
	<body>
		<h1 align="center">General Request Echo</h1>
		<hr>
		<table>
			<tbody>
			<?php
			# Print protocol
			print "<tr><td>Protocol:</td><td>" . $_SERVER['SERVER_PROTOCOL'] . "</td></tr>";

			# Print method
			print "<tr><td>Method:</td><td>" . $_SERVER['REQUEST_METHOD'] . "</td></tr>";

			# Print Query String
			print "<tr><td>Query String:</td><td>" . $_SERVER['QUERY_STRING'] . "</td></tr>";

			# Print Message Body
			$body = file_get_contents("php://input");

			print "<tr><td>Message Body:</td><td>$body</td></tr>";		

			?>
			</tbody>
		</table>
	</body>
</html>
