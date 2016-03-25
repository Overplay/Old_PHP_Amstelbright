API VERSION 2
-------------

API version 1 was just for demos and was a nasty bit of hackery. Version 2 is intended to be usable for alpha/beta testing 
and will ultimately be replaced with a NodeJS back end.

For version 2, we're trying out the Slim PHP REST framework. However, the hardware only supports PHP 5.2 (max of 5.3 with pain)
and this precludes us using any version Slim above 1.x. Composer is used just to pull the release from the cloud, then
Slim is moved to its directory right under V2. None of the Composer autoload magic is used because it probably would
fail under PHP 5.2.



