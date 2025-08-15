<!DOCTYPE html>
<html>
	<head>
		<title>POST Request Echo</title>
	</head>
	<body>
		<h1 align="center">POST Request Echo</h1>
		<hr>
		<p><strong>Message Body:</strong></p>
		<ul>
			<li>
                <?php
                    # Read message body payload
                    $body = file_get_contents("php://input");
                    if (strlen($body) == 0) {
                        print "(null)";
                    } else {
                        print $body;
                    }
                ?>
			</li>
		</ul>
	</body>
</html>
