<?php declare(strict_types=1);
/**
 * This implement the Shipment endpoint class for the Biobank Module.
 *
 * PHP Version 7.2
 *
 * @category   API
 * @package    Loris
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Loris/
 */
namespace LORIS\biobank;
use \Psr\Http\Message\ServerRequestInterface;
use \Psr\Http\Server\RequestHandlerInterface;
use \Psr\Http\Message\ResponseInterface;

/**
 * A class for handling the /biobank/shipments/ endpoint.
 *
 * PHP Version 7.2
 *
 * @category   Biobank
 * @package    Main
 * @subpackage Biobank
 * @author     Henri Rabalais <henri.rabalais@mcin.ca>
 * @license    http://www.gnu.org/licenses/gpl-3.0.text GPLv3
 * @link       http://www.github.com/aces/Lors/
 */
class Shipments implements RequestHandlerInterface
{
    /**
     * Returns true if user has acces to this Endpoint.
     *
     * @param \User $user The user whose access is being checked
     *
     * @return bool
     */
    function _hasAccess(\User $user) : bool
    {
        return true;
    }

    /**
     * Return which methods are supported by this endpoint.
     *
     * @return array supported HTTP methods
     */
    protected function allowedMethods() : array
    {
        return [
                'GET',
                'PUT',
                'POST',
                'OPTIONS',
               ];
    }

    /**
     * This function passes the request to the handler. This is necessary since
     * the Endpoint bypass the Module class.
     *
     * TODO: This function should be extracted to a parent class.
     *
     * @param ServerRequestInterface  $request The PSR7 request.
     * @param RequestHandlerInterface $handler The request handler.
     *
     * @return ResponseInterface The outgoing PSR7 response.
     */
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ) : ResponseInterface {
        return $handler->handle($request);
    }

    /**
     * Handles Endpoint requests
     *
     * @param ServerRequestInterface $request The incoming PSR7 request
     *
     * @return ResponseInterface The outgoing PSR7 response
     */
    public function handle(ServerRequestInterface $request) : ResponseInterface
    {
        $db       = \Database::singleton();
        $user     = $request->getAttribute('user');
        $shipCont = new ShipmentController($db, $user);

        $pathparts = $request->getAttribute('pathparts');

        switch($request->getMethod()) {
        case 'GET':
            $shipments = $shipCont->getInstances();
            return new \LORIS\Http\Response\OK($shipments);
        case 'POST':
            $shipment = json_decode($request->getBody()->getContents(), true);
            $shipments = $shipCont->createInstance($shipment);
            return new \LORIS\Http\Response\OK([$shipments]);
        case 'PUT':
        case 'OPTIONS':
            return (new \LORIS\Http\Response())
                ->withHeader('Allow', $this->allowedMethods());
        }
    }
}
