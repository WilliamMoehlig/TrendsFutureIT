<?php
$ptitle = "Rainfall";
?>
<script
src="https://code.jquery.com/jquery-3.3.1.min.js"
integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.4.0/dist/leaflet.css"
integrity="sha512-puBpdR0798OZvTTbP4A8Ix/l+A4dHDD0DGqYW6RQ+9jxkRFclaxxQb/SJAWZfWAkuyeQUytO7+7N4QKrDh+drA=="
crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
integrity="sha512-QVftwZFqvtRNi0ZyCtsznlKSWOStnDORoefr1enyq5mVL4tmKB3S/EnC3rRJcxCPavG10IcrVGSmPh6Qw5lwrg=="
crossorigin=""></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.3/Chart.bundle.js"
            integrity="sha256-o8aByMEvaNTcBsw94EfRLbBrJBI+c3mjna/j4LrfyJ8="
            crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/file-saver@2.0.0/dist/FileSaver.min.js"
        integrity="sha256-5Fv+LQlkb6dD3pAHzJb7FLI1iSqJE9GCza+HQtcI06k="
        crossorigin="anonymous"></script>
<script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

<div id="content" class="section">
    <p>
        <input type="button" id="export" name="export" class="exportButton" value="Export data" />
        <br>Visualisation
    </p>
    <div id="mapwrapper">
		<div id="station_map"></div>
		<div id="graphContainer">
		  <div id="divDateTime" style="display:none;">
			<input type="text" id="txtDateTime">
			<button onclick="changedDate()">Update</button>
		  </div>
		  <canvas style="display:none;" id="rfGraph" height="450" width="500"></canvas>
		</div>
	 </div>
</div>
</body>
</html>

<script type="text/babel" src="js/rainfall.js"></script>