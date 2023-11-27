# Database scripts

Execute the script inside the smartuser database in the following order:

1. `smartsocials.sql`
2. `smartsocial_permissions.sql`

if you have the stock database you also have to execute:
`smartuser_update.sql`

In case of a bigger database update you have to execute the deletion script, before re-executing the other scripts:
`smartsocials_cleanup.sql`
