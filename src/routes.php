<?php
// Routes

$app->get('/echo/[{name}]', function ($request, $response, $args) {
    // Sample log message
    $this->logger->info("Slim-Skeleton '/' route");

    // Render index view
    return $this->renderer->render($response, 'index.phtml', $args);
});

$app->get('/api/v1/overplayos', function ($request, $response, $args) {
    // Sample log message
    $this->logger->info("Slim-Skeleton '/api/v1/overplayos' route");

    $arr = array('response' => "I'm sorry Dave, I can't do that.");

    return json_encode($arr);
});

$app->get('/api/v1/overplayos/launch', function ($request, $response, $args) {
    // Sample log message
    //$this->logger->info("Slim-Skeleton '/api/v1/overplayos' route");

    $arr = array('response' => "Ready to launch.");

    return json_encode($arr);
});
