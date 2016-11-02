Database:

-	Run the  following SQL statement in MySQL Database:

CREATE TABLE IF NOT EXISTS `tasks` ( 
`id` int(11) NOT NULL AUTO_INCREMENT, 
`title` varchar(255) NOT NULL, 
`status` tinyint(1) NOT NULL DEFAULT '0', 
`parent_id` int(11) NOT NULL DEFAULT '0', 
PRIMARY KEY (`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

Setting up Database in the project:

-	Open file: /app/config/config.local.neon
-	Update your parameters.

Backend

I use Nette PHP framework (Documentation: https://doc.nette.org/en/2.4/). 

Web host

The project is hosted on: https://legacy-tasking-system.000webhostapp.com/www/
